#!/usr/bin/env node
// Generate XCA's public GitHub activity snapshot without external dependencies.
// 生成 XCA 的 GitHub 公开活动快照，无需第三方依赖。
import { mkdir, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ORG = "XAUFE-CA";
export const DAYS = 28;
export const OUTPUT = resolve(
	dirname(fileURLToPath(import.meta.url)),
	"../profile/assets/community-pulse.svg",
);
export const OUTPUT_DARK = resolve(
	dirname(fileURLToPath(import.meta.url)),
	"../profile/assets/community-pulse-dark.svg",
);
const API = "https://api.github.com";

// Requests time out after 20 seconds by default. Network errors and HTTP
// 502/503/504 responses get one retry.
// 每次请求默认在 20 秒后超时；网络错误和 HTTP 502/503/504 响应最多重试一次。
export const REQUEST_TIMEOUT_MS = 20000;
const RETRY_STATUS = new Set([502, 503, 504]);
const MAX_RETRIES = 1;
const RETRY_BACKOFF_MS = 400;
const USAGE =
	"Usage: node scripts/update-community-pulse.mjs [--placeholder] [--dry-run [--theme light|dark]]";

function toDate(value) {
	if (value instanceof Date) return value;
	if (typeof value === "string" || typeof value === "number")
		return new Date(value);
	return null;
}
export function dayKey(value) {
	const date = toDate(value);
	if (!date || !Number.isFinite(date.getTime()))
		throw Error(`Invalid date: ${String(value)}`);
	return date.toISOString().slice(0, 10);
}
export function dateRange(now = new Date(), days = DAYS) {
	const end = new Date(
		Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
	);
	const start = new Date(end);
	start.setUTCDate(start.getUTCDate() - days + 1);
	return { start: dayKey(start), end: dayKey(end) };
}
export function histogram(items, now = new Date(), days = DAYS) {
	const first = Date.parse(`${dateRange(now, days).start}T00:00:00Z`);
	const buckets = Array(days).fill(0);
	for (const item of items) {
		const stamp = item?.commit?.committer?.date ?? item?.commit?.author?.date;
		if (!stamp) continue;
		const date = new Date(stamp);
		if (!Number.isFinite(date.getTime())) continue;
		const utc = Date.UTC(
			date.getUTCFullYear(),
			date.getUTCMonth(),
			date.getUTCDate(),
		);
		const index = Math.floor((utc - first) / 86400000);
		if (index >= 0 && index < days) buckets[index]++;
	}
	return buckets;
}
export function escapeXml(value) {
	return String(value).replace(
		/[&<>"']/g,
		(ch) =>
			({
				"&": "&amp;",
				"<": "&lt;",
				">": "&gt;",
				'"': "&quot;",
				"'": "&apos;",
			})[ch],
	);
}
// Use Neoverse-UI geometry and light colors. Dark combines Neoverse-UI
// neutrals with blue accents sampled from profile/assets/xca-banner-dark.png.
// 使用 Neoverse-UI 的几何与浅色配色；深色融合 Neoverse-UI 中性色和
// profile/assets/xca-banner-dark.png 的蓝色点缀，不模拟实时折射。
export const THEMES = {
	light: {
		canvas: "#F4F9FC",
		canvasEnd: "#EAF3F8",
		surface: "#FFFFFF",
		surfaceOpacity: 0.3,
		border: "#0F172A",
		borderOpacity: 0.11,
		ambient: "#38BDF8",
		ambientSecondary: "#34C99A",
		ambientTertiary: "#7C6EE6",
		title: "#0F172A",
		muted: "#405467",
		subtle: "#536A7B",
		empty: "#D8E7EF",
		accent: "#74BAE5",
		accentSoft: "#E1EFF9",
		activity: ["#D1FAE5", "#6EE7B7", "#34C99A", "#087F66"],
		badgeBg: "#DBEDF7",
		badgeText: "#405467",
	},
	dark: {
		canvas: "#050D1C",
		canvasEnd: "#0B182D",
		surface: "#132134",
		surfaceOpacity: 0.5,
		border: "#DBEAFE",
		borderOpacity: 0.08,
		ambient: "#0E81FD",
		ambientSecondary: "#3DD6A6",
		ambientTertiary: "#8C9BFF",
		title: "#F4F8FC",
		muted: "#B5C5D5",
		subtle: "#9AAEBB",
		empty: "#132134",
		accent: "#38BDF8",
		accentSoft: "#17354D",
		activity: ["#17354D", "#0E81FD", "#38BDF8", "#B5ECFE"],
		badgeBg: "#17354D",
		badgeText: "#B5C5D5",
	},
};

function rect(x, y, width, height, radius, fill, extra = "") {
	return (
		'<rect x="' +
		x +
		'" y="' +
		y +
		'" width="' +
		width +
		'" height="' +
		height +
		'" rx="' +
		radius +
		'" fill="' +
		fill +
		'"' +
		extra +
		"/>"
	);
}

function label(x, y, message, color, size, weight = 500, extra = "") {
	return (
		'<text x="' +
		x +
		'" y="' +
		y +
		'" fill="' +
		color +
		'" font-size="' +
		size +
		'" font-weight="' +
		weight +
		'"' +
		extra +
		">" +
		escapeXml(message) +
		"</text>"
	);
}

export function formatTimestamp(value) {
	const date = toDate(value);
	if (!date || !Number.isFinite(date.getTime()))
		throw Error(`Invalid sync timestamp: ${String(value)}`);
	return `${date.toISOString().slice(0, 16).replace("T", " ")} UTC`;
}

// Validate metric counts before rendering real data; never publish missing
// or invalid counts.
// 发布实际统计数据前，必须校验各项指标，避免展示缺失或无效的计数。
const METRICS = [
	["公开仓库", "publicRepos"],
	["近 28 天 Commit", "commitCount"],
	["近 28 天已合并 PR", "mergedPRs"],
	["待处理 Issue", "openIssues"],
];

function describeValue(value) {
	if (value === null) return "null";
	if (Array.isArray(value)) return "array";
	if (typeof value === "number") return String(value);
	if (typeof value === "string") return `string "${value}"`;
	return typeof value;
}

function requireCount(value, field) {
	if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
		throw Error(
			"Expected " +
				field +
				" to be a non-negative integer, received " +
				describeValue(value),
		);
	}
	return value;
}

function activityColor(count, max, palette) {
	if (count === 0) return palette.empty;
	const ratio = count / Math.max(max, 1);
	const step = ratio >= 0.75 ? 3 : ratio >= 0.45 ? 2 : ratio >= 0.2 ? 1 : 0;
	return palette.activity[step];
}

// Keep legend cells separate from the 28 daily-cell activity cells.
// 图例单元格独立于 28 个每日活动单元格（daily-cell）。
function activityLegend(p) {
	const size = 8;
	const caption = (x, message) =>
		label(x, 253, message, p.subtle, 12);
	return [
		caption(132, "少"),
		...[p.empty, ...p.activity].map((color, index) =>
			rect(
				154 + index * 12,
				245,
				size,
				size,
				2.5,
				color,
				` class="legend-cell" data-level="${index}"`,
			),
		),
		caption(220, "多"),
	].join("\n");
}

export function renderPanel(data, theme = "light") {
	const p = THEMES[theme];
	if (!p) throw Error(`Unknown theme: ${theme}`);
	const live = Boolean(data?.updatedAt);
	const recent = live ? data.dailyCommits : Array(DAYS).fill(0);
	if (
		!Array.isArray(recent) ||
		recent.length !== DAYS ||
		recent.some((value) => !Number.isInteger(value) || value < 0)
	) {
		throw Error("Expected exactly 28 daily non-negative integer buckets");
	}
	const timestamp = live ? formatTimestamp(data.updatedAt) : null;
	const period = live ? dateRange(new Date(data.updatedAt)) : null;
	const metrics = live
		? Object.fromEntries(
				METRICS.map(([, field]) => [field, requireCount(data[field], field)]),
			)
		: null;
	const values = METRICS.map(([name, field]) => [
		name,
		live ? metrics[field] : "—",
	]);
	const max = Math.max(1, ...recent);
	const cells = recent
		.map((count, index) => {
			const x = 48 + index * 33;
			return rect(
				x,
				270,
				25,
				24,
				6,
				activityColor(count, max, p),
				` class="daily-cell" data-day="${index + 1}"`,
			);
		})
		.join("\n");
	const summary = live
		? "公开仓库 " +
			metrics.publicRepos +
			" 个，近 28 天可检索 Commit " +
			metrics.commitCount +
			" 次，近 28 天已合并 PR " +
			metrics.mergedPRs +
			" 个，待处理 Issue " +
			metrics.openIssues +
			" 个。同步时间：" +
			timestamp +
			"。"
		: "等待首次同步公开 GitHub 活动数据。";
	const disclaimer =
		live && data.commitsTruncated
			? "逐日活动最多取 300 条可检索 Commit · 不含非公开活动"
			: "GitHub 公开检索数据 · 不含非公开活动 · 通常每 6 小时刷新";
	const rangeText = live
		? `${period.start} — ${period.end} · UTC`
		: "近 28 天 · UTC";

	// Mask the composed opaque panel once so translucent layers cannot
	// change the alpha silhouette at the corners.
	// 对不透明面板合成结果统一应用蒙版，
	// 避免半透明图层叠加改变圆角的透明轮廓。
	return [
		'<svg xmlns="http://www.w3.org/2000/svg" xml:lang="zh-CN" width="1024" height="342" viewBox="0 0 1024 342" role="img" aria-labelledby="title description">',
		'<title id="title">XCA 社区动态 · ' +
			(theme === "light" ? "浅色" : "深色") +
			"</title>",
		`<desc id="description">${escapeXml(summary)}</desc>`,
		`<defs>
<linearGradient id="plate" x1="0" y1="0" x2="1" y2="1">
<stop stop-color="${p.canvas}"/><stop offset="1" stop-color="${p.canvasEnd}"/>
</linearGradient>
<radialGradient id="ice"><stop stop-color="${p.ambient}" stop-opacity=".13"/><stop offset="1" stop-color="${p.ambient}" stop-opacity="0"/></radialGradient>
<radialGradient id="mint"><stop stop-color="${p.ambientSecondary}" stop-opacity=".08"/><stop offset="1" stop-color="${p.ambientSecondary}" stop-opacity="0"/></radialGradient>
<radialGradient id="violet"><stop stop-color="${p.ambientTertiary}" stop-opacity=".07"/><stop offset="1" stop-color="${p.ambientTertiary}" stop-opacity="0"/></radialGradient>
<mask id="panel-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="342">${rect(0, 0, 1024, 342, 24, "#FFFFFF")}</mask>
</defs>`,
		'<g mask="url(#panel-mask)">',
		rect(0, 0, 1024, 342, 0, "url(#plate)"),
		'<ellipse cx="920" cy="20" rx="440" ry="240" fill="url(#ice)"/>',
		'<ellipse cx="420" cy="342" rx="480" ry="190" fill="url(#mint)"/>',
		'<ellipse cx="40" cy="40" rx="240" ry="180" fill="url(#violet)"/>',
		rect(
			0.5,
			0.5,
			1023,
			341,
			24,
			"none",
			` stroke="${p.border}" stroke-opacity="${p.borderOpacity}"`,
		),
		'<g font-family="Inter Variable,Inter,Noto Sans SC Variable,Noto Sans SC,PingFang SC,Microsoft YaHei,Segoe UI,Arial,sans-serif">',
		rect(32, 28, 40, 40, 12, p.accentSoft),
		`<path d="M41 49 H46 L50 40 L55 56 L59 47 H64" fill="none" stroke="${p.accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
		label(84, 49, "社区动态", p.title, 20, 650),
		label(84, 74, "XCA / 开源协作记录", p.subtle, 13),
		rect(867, 28, 125, 28, 14, p.badgeBg),
		`<circle cx="885" cy="42" r="3" fill="${p.accent}"/>`,
		label(898, 47, "公开活动快照", p.badgeText, 13, 650),
		label(
			992,
			80,
			live ? `同步时间 ${timestamp}` : "尚未初始化",
			p.subtle,
			12,
			500,
			' text-anchor="end"',
		),
		...values.flatMap(([name, value], index) => {
			const x = 32 + 244 * index;
			return [
				rect(
					x,
					104,
					228,
					112,
					16,
					p.surface,
					` fill-opacity="${p.surfaceOpacity}"`,
				),
				label(x + 20, 134, name, p.muted, 16, 650),
				label(
					x + 20,
					194,
					value,
					p.title,
					48,
					750,
					' class="metric-value" letter-spacing="-1.92" style="font-variant-numeric:tabular-nums"',
				),
			];
		}),
		rect(
			32,
			232,
			960,
			78,
			16,
			p.surface,
			` fill-opacity="${p.surfaceOpacity}"`,
		),
		label(48, 254, "逐日活动", p.title, 14, 650),
		activityLegend(p),
		label(976, 254, rangeText, p.subtle, 12, 500, ' text-anchor="end"'),
		cells,
		label(32, 330, disclaimer, p.subtle, 12, 400),
		"</g></g></svg>",
		"",
	].join("\n");
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// Request a GitHub API path with a timeout and one retry for network errors
// or HTTP 502/503/504. Report request failures with the route and HTTP status
// when available.
// 请求 GitHub API 时设置超时，仅对网络错误和 HTTP 502/503/504 重试一次。
// 请求失败时，错误信息包含请求路径；若收到 HTTP 响应，也包含状态码。
export async function github(
	path,
	token = process.env.GITHUB_TOKEN,
	options = {},
) {
	const fetchImpl = options.fetchImpl ?? fetch;
	const timeoutMs = options.timeoutMs ?? REQUEST_TIMEOUT_MS;
	const backoffMs = options.backoffMs ?? RETRY_BACKOFF_MS;
	if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
		throw Error(
			"Expected a positive GitHub request timeout, received " +
				String(timeoutMs),
		);
	}
	const route = path.split("?")[0];
	const headers = {
		Accept: "application/vnd.github+json",
		"User-Agent": "XCA-community-pulse",
		"X-GitHub-Api-Version": "2022-11-28",
		...(token ? { Authorization: `Bearer ${token}` } : {}),
	};
	for (let attempt = 1; ; attempt++) {
		let response;
		try {
			response = await fetchImpl(API + path, {
				headers,
				signal: AbortSignal.timeout(timeoutMs),
			});
			// Read the body inside the same timeout and retry boundary.
			// 响应体读取与请求使用相同的超时和重试边界。
			if (response.ok) return await response.json();
		} catch (error) {
			const timedOut =
				error?.name === "TimeoutError" || error?.name === "AbortError";
			if (response?.ok && !timedOut && !(error instanceof TypeError)) {
				throw Error(`GitHub API returned invalid JSON at ${route}`, {
					cause: error,
				});
			}
			const detail = timedOut
				? `timeout after ${timeoutMs}ms`
				: `network error: ${error?.message || String(error)}`;
			if (attempt > MAX_RETRIES) {
				throw Error(
					"GitHub API " +
						detail +
						" at " +
						route +
						" (after " +
						MAX_RETRIES +
						" retry)",
					{ cause: error },
				);
			}
			await sleep(backoffMs);
			continue;
		}
		if (!RETRY_STATUS.has(response.status) || attempt > MAX_RETRIES) {
			const error = Error(
				"GitHub API HTTP " +
					response.status +
					" at " +
					route +
					(attempt > 1 ? ` (after ${attempt - 1} retry)` : ""),
			);
			error.status = response.status;
			throw error;
		}
		await sleep(backoffMs);
	}
}
async function listRepos(token) {
	const list = [];
	for (let page = 1; page <= 30; page++) {
		const params = new URLSearchParams({
			type: "public",
			per_page: "100",
			page: String(page),
		});
		const result = await github(`/orgs/${ORG}/repos?${params}`, token);
		if (!Array.isArray(result)) throw Error("Invalid repository response");
		list.push(...result.filter((repo) => repo.private === false));
		if (result.length < 100) return list;
	}
	throw Error(
		"Repo pagination exceeds supported limit; refusing partial totals",
	);
}
async function issueTotal(q, token) {
	const result = await github(
		`/search/issues?${new URLSearchParams({ q, per_page: "1" })}`,
		token,
	);
	if (result.incomplete_results === true)
		throw Error("GitHub issue search returned incomplete results");
	if (typeof result.total_count !== "number")
		throw Error("Invalid issues search");
	return result.total_count;
}
async function commitSearch(period, token) {
	const q = `org:${ORG} is:public committer-date:${period.start}..${period.end}`;
	const items = [];
	let total = 0;
	for (let page = 1; page <= 3; page++) {
		const params = new URLSearchParams({
			q,
			per_page: "100",
			page: String(page),
			sort: "committer-date",
			order: "desc",
		});
		const result = await github(`/search/commits?${params}`, token);
		if (result.incomplete_results === true)
			throw Error("GitHub commit search returned incomplete results");
		if (!Array.isArray(result.items) || typeof result.total_count !== "number")
			throw Error("Invalid commits search");
		total = result.total_count;
		items.push(...result.items);
		if (items.length >= total || result.items.length < 100) break;
	}
	return { total, items, truncated: items.length < total };
}
export async function gather(
	now = new Date(),
	token = process.env.GITHUB_TOKEN,
) {
	const period = dateRange(now);
	const repos = await listRepos(token);
	const commits = await commitSearch(period, token);
	const mergedPRs = await issueTotal(
		`org:${ORG} is:public is:pr is:merged merged:${period.start}..${period.end}`,
		token,
	);
	const openIssues = await issueTotal(`org:${ORG} is:public is:issue is:open`, token);
	return {
		updatedAt: now.toISOString(),
		publicRepos: repos.length,
		commitCount: commits.total,
		mergedPRs,
		openIssues,
		dailyCommits: histogram(commits.items, now),
		commitsTruncated: commits.truncated,
	};
}

// Stage every changed variant before replacing files; restore earlier replacements
// on failure. Keep recovery files if restoring also fails.
// 所有变体暂存完成后才替换文件；替换失败时恢复此前变更，
// 若恢复也失败则保留恢复文件。
export async function writePanels(variants, { renameImpl = rename } = {}) {
	const pending = [];
	for (const [file, svg] of variants) {
		let before = null;
		try {
			before = await readFile(file);
		} catch (error) {
			if (error.code !== "ENOENT") throw error;
		}
		const contents = Buffer.from(svg);
		if (before !== null && before.equals(contents)) continue;
		pending.push({ file, before, contents });
	}
	if (pending.length === 0) return 0;

	await mkdir(dirname(pending[0].file), { recursive: true });
	const staging = await mkdtemp(resolve(dirname(pending[0].file), ".community-pulse-"));
	let keepRecovery = false;
	let updateError;
	try {
		for (const [index, panel] of pending.entries()) {
			panel.next = resolve(staging, `next-${index}.svg`);
			panel.backup = resolve(staging, `previous-${index}.svg`);
			await writeFile(panel.next, panel.contents);
			if (panel.before !== null) await writeFile(panel.backup, panel.before);
		}
		let installed = 0;
		try {
			for (const panel of pending) {
				await renameImpl(panel.next, panel.file);
				installed++;
			}
		} catch (error) {
			const failures = [error];
			for (let index = installed - 1; index >= 0; index--) {
				const panel = pending[index];
				try {
					if (panel.before === null) await rm(panel.file);
					else await renameImpl(panel.backup, panel.file);
				} catch (restoreError) {
					failures.push(restoreError);
				}
			}
			if (failures.length > 1) {
				keepRecovery = true;
				throw new AggregateError(
					failures,
					`Snapshot update and recovery failed; recovery files: ${staging}`,
					{ cause: error },
				);
			}
			throw error;
		}
	} catch (error) {
		updateError = error;
	}
	if (!keepRecovery) {
		try {
			await rm(staging, { recursive: true, force: true });
		} catch (cleanupError) {
			if (updateError) {
				throw new AggregateError(
					[updateError, cleanupError],
					`Snapshot update and cleanup failed; recovery files: ${staging}`,
					{ cause: updateError },
				);
			}
			throw cleanupError;
		}
	}
	if (updateError) throw updateError;
	return pending.length;
}

function parseTheme(value) {
	const theme = String(value).toLowerCase();
	if (!Object.hasOwn(THEMES, theme)) {
		throw Error(
			`${USAGE}\nUnknown theme: ${value} (expected "light" or "dark")`,
		);
	}
	return theme;
}

function parseArgs(argv) {
	const options = {
		placeholder: false,
		dryRun: false,
		theme: "light",
		themeGiven: false,
	};
	for (let index = 0; index < argv.length; index++) {
		const arg = argv[index];
		if (arg === "--placeholder") options.placeholder = true;
		else if (arg === "--dry-run") options.dryRun = true;
		else if (arg === "--theme") {
			options.themeGiven = true;
			const value = argv[++index];
			if (value === undefined)
				throw Error(`${USAGE}\n--theme expects "light" or "dark"`);
			options.theme = parseTheme(value);
		} else if (arg.startsWith("--theme=")) {
			options.themeGiven = true;
			options.theme = parseTheme(arg.slice("--theme=".length));
		} else {
			throw Error(`${USAGE}\nUnknown argument: ${arg}`);
		}
	}
	if (options.themeGiven && !options.dryRun) {
		throw Error(
			USAGE +
				"\n--theme is only supported together with --dry-run; the refresh writes both themes",
		);
	}
	return options;
}

async function main() {
	const options = parseArgs(process.argv.slice(2));
	const data = options.placeholder ? null : await gather();
	if (options.dryRun) {
		process.stdout.write(renderPanel(data, options.theme));
		return;
	}
	const variants = [
		[OUTPUT, renderPanel(data, "light")],
		[OUTPUT_DARK, renderPanel(data, "dark")],
	];
	const changed = await writePanels(variants);
	console.log(
		changed
			? `Community pulse refreshed (${changed} themes)`
			: "Community pulse unchanged",
	);
}
if (
	process.argv[1] &&
	fileURLToPath(import.meta.url).toLowerCase() ===
		resolve(process.argv[1]).toLowerCase()
) {
	main().catch((error) => {
		console.error(error.message);
		process.exitCode = 1;
	});
}
