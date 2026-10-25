import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import {
	DAYS,
	dateRange,
	dayKey,
	escapeXml,
	formatTimestamp,
	gather,
	github,
	histogram,
	renderPanel,
	writePanels,
} from "./update-community-pulse.mjs";

const SCRIPT = fileURLToPath(
	new URL("./update-community-pulse.mjs", import.meta.url),
);

function model(overrides = {}) {
	return {
		updatedAt: "2026-10-17T08:00:00.000Z",
		publicRepos: 3,
		commitCount: 27,
		mergedPRs: 2,
		openIssues: 4,
		dailyCommits: Array(DAYS).fill(1),
		commitsTruncated: false,
		...overrides,
	};
}

function cellCount(svg) {
	return (svg.match(/class="daily-cell"/g) ?? []).length;
}

function runCli(args, cwd) {
	return spawnSync(process.execPath, [SCRIPT, ...args], {
		encoding: "utf8",
		cwd,
	});
}

test("UTC date range covers exactly 28 calendar days", () => {
	assert.deepEqual(dateRange(new Date("2026-10-17T23:55:00Z")), {
		start: "2026-09-20",
		end: "2026-10-17",
	});
});
test("calendar buckets include boundaries and ignore older dates", () => {
	const sample = [
		{ commit: { committer: { date: "2026-09-20T00:00:00Z" } } },
		{ commit: { committer: { date: "2026-10-17T23:59:59Z" } } },
		{ commit: { committer: { date: "2026-09-19T23:59:59Z" } } },
		{ commit: { author: { date: "2026-10-17T00:00:00Z" } } },
	];
	const daily = histogram(sample, new Date("2026-10-17T13:00:00Z"));
	assert.equal(daily.length, 28);
	assert.equal(daily[0], 1);
	assert.equal(daily[27], 2);
	assert.equal(
		daily.reduce((a, b) => a + b, 0),
		3,
	);
});
test("sanitize SVG text safely", () => {
	assert.equal(escapeXml("&<>\"'"), "&amp;&lt;&gt;&quot;&apos;");
});
test("render public metrics with clear time and counting scope", () => {
	const svg = renderPanel({
		updatedAt: "2026-10-17T08:00:00.000Z",
		publicRepos: 3,
		commitCount: 27,
		mergedPRs: 2,
		openIssues: 4,
		dailyCommits: Array(28).fill(1),
		commitsTruncated: false,
	});
	assert.match(svg, /2026-10-17 08:00 UTC/);
	const values = [...svg.matchAll(/class="metric-value"[^>]*>(\d+)<\/text>/g)].map(
		(match) => Number(match[1]),
	);
	assert.deepEqual(values, [3, 27, 2, 4]);
	assert.match(svg, /<svg/);
	assert.equal((svg.match(/class="daily-cell"/g) ?? []).length, 28);
});
test("reject malformed daily array instead of rendering incorrect data", () => {
	assert.throws(
		() =>
			renderPanel({ updatedAt: new Date().toISOString(), dailyCommits: [1] }),
		/28 daily/,
	);
});

test("both themes preserve public data in safe static SVG", () => {
	const model = {
		updatedAt: "2026-10-17T08:00:00.000Z",
		publicRepos: 4,
		commitCount: 9,
		mergedPRs: 2,
		openIssues: 1,
		dailyCommits: [1, 0, 3, 0, 2, ...Array(23).fill(0)],
		commitsTruncated: false,
	};
	const light = renderPanel(model, "light");
	const dark = renderPanel(model, "dark");
	assert.notEqual(light, dark);
	assert.match(light, /2026-10-17 08:00 UTC/);
	assert.match(dark, /2026-10-17 08:00 UTC/);
	for (const svg of [light, dark]) {
		assert.equal((svg.match(/class="daily-cell"/g) ?? []).length, 28);
		assert.doesNotMatch(svg, /NaN|undefined|<script|<foreignObject/);
	}
});
test("chart rejects unsupported themes and invalid daily values", () => {
	assert.throws(() => renderPanel(null, "solarized"), /Unknown theme/);
	const model = {
		updatedAt: "2026-10-17T00:00:00Z",
		dailyCommits: [...Array(27).fill(0), -1],
	};
	assert.throws(() => renderPanel(model, "dark"), /28 daily non-negative/);
});

test("live metrics must be non-negative integers", () => {
	const invalid = [
		["publicRepos", -1],
		["publicRepos", 1.5],
		["publicRepos", "3"],
		["publicRepos", null],
		["publicRepos", Number.NaN],
		["publicRepos", undefined],
		["commitCount", -2],
		["commitCount", "many"],
		["mergedPRs", 2.25],
		["openIssues", -0.5],
	];
	for (const [field, value] of invalid) {
		assert.throws(
			() => renderPanel(model({ [field]: value })),
			new RegExp(`Expected ${field} to be a non-negative integer`),
			`${field}=${String(value)} must be rejected`,
		);
	}
	const svg = renderPanel(
		model({ publicRepos: 0, commitCount: 0, mergedPRs: 0, openIssues: 0 }),
	);
	assert.equal((svg.match(/class="metric-value"[^>]*>0<\/text>/g) ?? []).length, 4);
});

test("placeholder renders in both themes without invented data", () => {
	for (const theme of ["light", "dark"]) {
		const svg = renderPanel(null, theme);
		assert.equal((svg.match(/—/g) ?? []).length, 4);
		assert.equal(cellCount(svg), 28);
		assert.doesNotMatch(svg, /NaN|undefined/);
	}
});

test("activity legend uses squares matching every daily intensity including zero", () => {
	for (const theme of ["light", "dark"]) {
		const dailyCommits = [0, 1, 3, 5, 8, ...Array(23).fill(0)];
		const svg = renderPanel(model({ dailyCommits }), theme);
		const colors = (className) =>
			[...svg.matchAll(new RegExp(`fill="([^"]+)" class="${className}"`, "g"))]
				.map((match) => match[1]);
		const dailyColors = colors("daily-cell");
		assert.equal(cellCount(svg), 28);
		assert.deepEqual(colors("legend-cell"), dailyColors.slice(0, 5));
		assert.equal(new Set(dailyColors).size, 5);
		for (const [cell] of svg.matchAll(/<rect\b[^>]*class="legend-cell"[^>]*\/>/g)) {
			const width = Number(cell.match(/\bwidth="([^"]+)"/)[1]);
			const height = Number(cell.match(/\bheight="([^"]+)"/)[1]);
			assert.equal(width, height, `${theme} legend cells must stay square`);
		}
	}
});

test("dayKey rejects invalid dates", () => {
	assert.equal(dayKey("2026-10-17T23:55:00Z"), "2026-10-17");
	assert.equal(dayKey(new Date("2026-10-17T00:00:00Z")), "2026-10-17");
	for (const value of [
		undefined,
		null,
		"",
		"not-a-date",
		"2026-13-40",
		Number.NaN,
		{},
		[],
	]) {
		assert.throws(
			() => dayKey(value),
			/Invalid date: /,
			`dayKey must reject ${String(value)}`,
		);
	}
	assert.throws(() => dateRange(new Date("invalid")), /Invalid date: /);
});

test("histogram ignores entries without a usable date", () => {
	const sample = [
		{},
		{ commit: {} },
		{ commit: { committer: {} } },
		{ commit: { committer: { date: "not-a-date" } } },
		{ commit: { author: { date: null } } },
		null,
		{ commit: { committer: { date: "2026-10-17T00:00:00Z" } } },
	];
	const daily = histogram(sample, new Date("2026-10-17T13:00:00Z"));
	assert.equal(daily.length, 28);
	assert.equal(
		daily.reduce((a, b) => a + b, 0),
		1,
	);
	assert.equal(daily[27], 1);
});

test("formatTimestamp formats valid stamps and rejects invalid ones", () => {
	assert.equal(
		formatTimestamp("2026-10-17T08:00:00.000Z"),
		"2026-10-17 08:00 UTC",
	);
	assert.equal(
		formatTimestamp(new Date("2026-10-17T08:00:00.000Z")),
		"2026-10-17 08:00 UTC",
	);
	assert.equal(formatTimestamp(0), "1970-01-01 00:00 UTC");
	for (const value of [undefined, null, "not-a-date", "", Number.NaN, {}]) {
		assert.throws(() => formatTimestamp(value), /Invalid sync timestamp: /);
	}
	assert.throws(
		() =>
			renderPanel({ updatedAt: "garbage", dailyCommits: Array(DAYS).fill(0) }),
		/Invalid sync timestamp/,
	);
});

test("gather excludes private activity even when its token can read it", async (t) => {
	const now = new Date("2026-10-17T08:00:00Z");
	const commit = { commit: { committer: { date: now.toISOString() } } };
	t.mock.method(globalThis, "fetch", async (url) => {
		const request = new URL(url);
		const q = request.searchParams.get("q") ?? "";
		const publicOnly = q.split(/\s+/).includes("is:public");
		let body;
		if (request.pathname.endsWith("/repos")) {
			body = [{ private: false }];
		} else if (request.pathname === "/search/commits") {
			const items = publicOnly ? [commit] : [commit, commit];
			body = { total_count: items.length, incomplete_results: false, items };
		} else if (request.pathname === "/search/issues") {
			body = {
				total_count: q.includes("is:pr")
					? (publicOnly ? 2 : 10)
					: (publicOnly ? 3 : 12),
				incomplete_results: false,
			};
		} else {
			throw new Error(`Unexpected request: ${request.pathname}`);
		}
		return { ok: true, status: 200, json: async () => body };
	});
	assert.deepEqual(await gather(now, "synthetic-token"), {
		updatedAt: now.toISOString(),
		publicRepos: 1,
		commitCount: 1,
		mergedPRs: 2,
		openIssues: 3,
		dailyCommits: [...Array(27).fill(0), 1],
		commitsTruncated: false,
	});
});

test("gather bounds dated activity to the same complete UTC days as the chart", async (t) => {
	const dates = [
		"2026-09-26T23:59:59Z",
		"2026-09-27T00:00:00Z",
		"2026-10-24T23:59:59Z",
		"2026-10-25T00:00:00Z",
	];
	const searchDates = (q, qualifier) => {
		const value = q.split(/\s+/)
			.find((term) => term.startsWith(`${qualifier}:`))
			.slice(qualifier.length + 1);
		const [start, end] = value.replace(/^>=/, "").split("..");
		return dates.filter((date) => {
			const day = date.slice(0, 10);
			return day >= start && (!end || day <= end);
		});
	};
	t.mock.method(globalThis, "fetch", async (url) => {
		const request = new URL(url);
		const q = request.searchParams.get("q") ?? "";
		let body;
		if (request.pathname.endsWith("/repos")) {
			body = [{ private: false }];
		} else if (request.pathname === "/search/commits") {
			const items = searchDates(q, "committer-date").map((date) => ({
				commit: { committer: { date } },
			}));
			body = { total_count: items.length, incomplete_results: false, items };
		} else if (request.pathname === "/search/issues") {
			body = {
				total_count: q.includes("is:pr") ? searchDates(q, "merged").length : 0,
				incomplete_results: false,
			};
		} else {
			throw new Error(`Unexpected request: ${request.pathname}`);
		}
		return { ok: true, status: 200, json: async () => body };
	});
	const data = await gather(new Date("2026-10-24T08:00:00Z"), "synthetic-token");
	assert.equal(data.commitCount, 2);
	assert.equal(data.mergedPRs, 2);
	assert.deepEqual(data.dailyCommits, [1, ...Array(26).fill(0), 1]);
	assert.equal(data.commitsTruncated, false);
});

test("github retries once on 502/503/504 and reports success", async () => {
	let calls = 0;
	const seen = [];
	const fetchImpl = async (url, init) => {
		calls++;
		seen.push({ url, init });
		if (calls === 1) return { ok: false, status: 503, json: async () => ({}) };
		return { ok: true, status: 200, json: async () => ({ total_count: 7 }) };
	};
	const body = await github("/search/issues?q=x", "token-1", {
		fetchImpl,
		backoffMs: 1,
	});
	assert.deepEqual(body, { total_count: 7 });
	assert.equal(calls, 2);
	assert.equal(seen[0].url, "https://api.github.com/search/issues?q=x");
	assert.equal(seen[0].init.headers.Authorization, "Bearer token-1");
	assert.equal(seen[0].init.headers.Accept, "application/vnd.github+json");
	assert.ok(seen[0].init.signal instanceof AbortSignal);
});

test("github gives up after one retry and names path and status", async () => {
	let calls = 0;
	const fetchImpl = async () => {
		calls++;
		return { ok: false, status: 502, json: async () => ({}) };
	};
	try {
		await github("/search/issues?q=org%3AXAUFE-CA", null, {
			fetchImpl,
			backoffMs: 1,
		});
		assert.fail("expected github() to throw");
	} catch (error) {
		assert.equal(calls, 2, "exactly one retry");
		assert.equal(error.status, 502);
		assert.match(error.message, /HTTP 502/);
		assert.match(error.message, /\/search\/issues/);
		assert.match(error.message, /after 1 retry/);
	}
});

test("github retries network failures once and then fails clearly", async () => {
	let calls = 0;
	const failure = new TypeError("fetch failed");
	const fetchImpl = async () => {
		calls++;
		throw failure;
	};
	await assert.rejects(
		github("/orgs/XAUFE-CA/repos?type=public", undefined, {
			fetchImpl,
			backoffMs: 1,
		}),
		/network error: fetch failed at \/orgs\/XAUFE-CA\/repos/,
	);
	assert.equal(calls, 2);

	// A successful retry after a transient network error must return the result.
	// 首次请求遇到临时网络错误时，应能通过一次重试取得成功结果。
	let recovered = 0;
	const flaky = async () => {
		recovered++;
		if (recovered === 1) throw new TypeError("fetch failed");
		return { ok: true, status: 200, json: async () => ({ ok: true }) };
	};
	assert.deepEqual(
		await github("/orgs/XAUFE-CA/repos", null, {
			fetchImpl: flaky,
			backoffMs: 1,
		}),
		{ ok: true },
	);
	assert.equal(recovered, 2);
});

test("github retries response-body transport failures", async () => {
	for (const failure of [
		new TypeError("response body disconnected"),
		new DOMException("response body aborted", "AbortError"),
		new DOMException("response body timed out", "TimeoutError"),
	]) {
		let calls = 0;
		const fetchImpl = async () => {
			calls++;
			return calls === 1
				? new Response(new ReadableStream({
					start(controller) { controller.error(failure); },
				}))
				: Response.json({ total_count: 7 });
		};
		assert.deepEqual(
			await github("/search/commits", null, { fetchImpl, backoffMs: 1 }),
			{ total_count: 7 },
		);
		assert.equal(calls, 2, failure.name);
	}
});

test("github reports response-body timeouts after one retry", async () => {
	let calls = 0;
	const fetchImpl = async () => {
		calls++;
		return new Response(new ReadableStream({
			start(controller) {
				controller.error(new DOMException("body timeout", "TimeoutError"));
			},
		}));
	};
	await assert.rejects(
		github("/search/commits", null, { fetchImpl, timeoutMs: 20, backoffMs: 1 }),
		/timeout after 20ms at \/search\/commits \(after 1 retry\)/,
	);
	assert.equal(calls, 2);
});

test("github does not retry malformed JSON as a transport failure", async () => {
	let calls = 0;
	const fetchImpl = async () => {
		calls++;
		return new Response("{not valid json");
	};
	await assert.rejects(
		github("/search/issues", null, { fetchImpl, backoffMs: 1 }),
		/invalid JSON at \/search\/issues/,
	);
	assert.equal(calls, 1);
});

test("github times out without hanging and keeps path in the error", async () => {
	const fetchImpl = (_url, init) =>
		new Promise((_resolve, reject) => {
			// A real request keeps a socket alive; model that reference until abort.
			// 真实请求会保持套接字存活；模拟请求也需在中止前保持事件循环存活。
			const timer = setTimeout(
				() => reject(new Error("Mock request did not abort")),
				1000,
			);
			init.signal.addEventListener("abort", () => {
				clearTimeout(timer);
				reject(init.signal.reason);
			}, { once: true });
		});
	await assert.rejects(
		github("/search/commits?q=org", "token", {
			fetchImpl,
			timeoutMs: 20,
			backoffMs: 1,
		}),
		/timeout after 20ms at \/search\/commits/,
	);
	await assert.rejects(
		github("/orgs/XAUFE-CA/repos", "token", {
			fetchImpl,
			timeoutMs: 0,
			backoffMs: 1,
		}),
		/positive GitHub request timeout/,
	);
});

test("github does not retry non-transient failures", async () => {
	let calls = 0;
	const fetchImpl = async () => {
		calls++;
		return { ok: false, status: 404, json: async () => ({}) };
	};
	try {
		await github("/orgs/XAUFE-CA/repos", null, { fetchImpl, backoffMs: 1 });
		assert.fail("expected github() to throw");
	} catch (error) {
		assert.equal(calls, 1);
		assert.equal(error.status, 404);
		assert.match(error.message, /HTTP 404 at \/orgs\/XAUFE-CA\/repos/);
		assert.doesNotMatch(error.message, /retry/);
	}
});
async function outputFixture(t, directoryName = "_site") {
	const root = await mkdtemp(join(tmpdir(), "xca-pulse-test-"));
	t.after(() => rm(root, { recursive: true, force: true }));
	const directory = join(root, directoryName);
	await mkdir(directory, { recursive: true });
	return {
		root,
		directory,
		light: join(directory, "community-pulse.svg"),
		dark: join(directory, "community-pulse-dark.svg"),
	};
}

test("CLI preserves both existing snapshots when a target cannot be read", async (t) => {
	for (const mode of ["default", "separate", "equals"]) {
		const { root, directory, light, dark } = await outputFixture(
			t,
			mode === "default" ? "_site" : "output with spaces",
		);
		await writeFile(light, "previous light snapshot");
		await mkdir(dark);
		const args = ["--placeholder"];
		if (mode === "separate") args.push("--output-dir", "output with spaces");
		if (mode === "equals") args.push(`--output-dir=${directory}`);
		const result = runCli(args, root);
		assert.notEqual(result.status, 0, mode);
		assert.equal(await readFile(light, "utf8"), "previous light snapshot");
		assert.deepEqual(await readdir(dark), []);
		assert.deepEqual((await readdir(directory)).sort(), [
			"community-pulse-dark.svg",
			"community-pulse.svg",
		]);
	}
});

test("writePanels restores both snapshots after a replacement failure", async (t) => {
	const { directory, light, dark } = await outputFixture(t);
	await writeFile(light, "previous light snapshot");
	await writeFile(dark, "previous dark snapshot");
	const failure = Object.assign(new Error("simulated replacement failure"), { code: "EACCES" });
	await assert.rejects(
		writePanels([[light, "new light snapshot"], [dark, "new dark snapshot"]], {
			renameImpl: async (from, to) => {
				if (to === dark) throw failure;
				return rename(from, to);
			},
		}),
		{ code: "EACCES" },
	);
	assert.equal(await readFile(light, "utf8"), "previous light snapshot");
	assert.equal(await readFile(dark, "utf8"), "previous dark snapshot");
	assert.deepEqual((await readdir(directory)).sort(), [
		"community-pulse-dark.svg",
		"community-pulse.svg",
	]);
});

test("writePanels removes newly created snapshots if the pair cannot be published", async (t) => {
	const { directory, light, dark } = await outputFixture(t);
	await assert.rejects(
		writePanels([[light, "new light snapshot"], [dark, "new dark snapshot"]], {
			renameImpl: async (from, to) => {
				if (to === dark) {
					throw Object.assign(new Error("simulated replacement failure"), { code: "EACCES" });
				}
				return rename(from, to);
			},
		}),
		{ code: "EACCES" },
	);
	await assert.rejects(readFile(light), { code: "ENOENT" });
	await assert.rejects(readFile(dark), { code: "ENOENT" });
	assert.deepEqual(await readdir(directory), []);
});

test("writePanels retains recovery copies when rollback also fails", async (t) => {
	const { directory, light, dark } = await outputFixture(t);
	await writeFile(light, "previous light snapshot");
	await writeFile(dark, "previous dark snapshot");
	const replacementFailure = new Error("simulated replacement failure");
	const restoreFailure = new Error("simulated recovery failure");
	let replacementFailed = false;
	let reportedError;
	await assert.rejects(
		writePanels([[light, "new light snapshot"], [dark, "new dark snapshot"]], {
			renameImpl: async (from, to) => {
				if (to === dark) {
					replacementFailed = true;
					throw replacementFailure;
				}
				if (replacementFailed) throw restoreFailure;
				return rename(from, to);
			},
		}),
		(error) => {
			reportedError = error;
			return error instanceof AggregateError
				&& error.cause === replacementFailure
				&& error.errors.includes(restoreFailure);
		},
	);
	const recoveryDirectories = (await readdir(directory, { withFileTypes: true }))
		.filter((entry) => entry.isDirectory());
	assert.equal(recoveryDirectories.length, 1);
	const recovery = join(directory, recoveryDirectories[0].name);
	const contents = await Promise.all(
		(await readdir(recovery)).map((file) => readFile(join(recovery, file), "utf8")),
	);
	assert.ok(contents.includes("previous light snapshot"));
	assert.ok(contents.includes("previous dark snapshot"));
	assert.ok(reportedError.message.includes(recovery));
});

test("dry-run prints a single theme without creating output directories", async (t) => {
	const root = await mkdtemp(join(tmpdir(), "xca-pulse-preview-"));
	t.after(() => rm(root, { recursive: true, force: true }));
	const light = runCli(["--placeholder", "--dry-run"], root);
	assert.equal(light.status, 0, light.stderr);
	assert.match(light.stdout, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
	assert.equal(cellCount(light.stdout), 28);
	assert.equal(light.stderr, "");

	const dark = runCli([
		"--placeholder", "--dry-run", "--theme", "dark",
		"--output-dir", "unused output",
	], root);
	assert.equal(dark.status, 0, dark.stderr);
	assert.equal(cellCount(dark.stdout), 28);
	assert.notEqual(dark.stdout, light.stdout);
	assert.deepEqual(await readdir(root), []);
});

test("CLI rejects invalid arguments without creating outputs", async (t) => {
	const root = await mkdtemp(join(tmpdir(), "xca-pulse-arguments-"));
	t.after(() => rm(root, { recursive: true, force: true }));
	for (const args of [
		["--dry-run", "--verbose"],
		["--dry-run", "--theme", "sepia"],
		["--dry-run", "--theme"],
		["--theme", "dark"],
		["--output-dir"],
		["--output-dir", ""],
		["--output-dir="],
		["--output-dir", "--dry-run"],
	]) {
		const result = runCli(["--placeholder", ...args], root);
		assert.equal(result.status, 1, JSON.stringify(args));
		assert.equal(result.stdout, "");
	}
	assert.deepEqual(await readdir(root), []);
});
