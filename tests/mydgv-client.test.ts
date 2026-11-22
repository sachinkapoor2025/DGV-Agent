import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isMydgvConfigured, listEmployees } from "../src/integrations/mydgv/client";

describe("mydgv client", () => {
  it("reports unconfigured and fails safely offline", async () => {
    delete process.env.MYDGV_API_URL;
    delete process.env.MYDGV_DGV_OS_API_KEY;
    assert.equal(isMydgvConfigured(), false);
    const res = await listEmployees();
    assert.equal(res.ok, false);
    assert.equal(res.mode, "stub");
  });
});
