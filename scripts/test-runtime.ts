import { runRuntimeContractTests } from "@/lib/runtime/__tests__/runtime-contracts.test";

async function main() {
  console.log("==================================================");
  console.log("OVRA Real Node Runtime — Contract Test Suite");
  console.log("==================================================");

  try {
    const result = await runRuntimeContractTests();
    for (const d of result.details) {
      console.log(d);
    }
    console.log("--------------------------------------------------");
    if (result.passed) {
      console.log("ALL RUNTIME CONTRACT TESTS PASSED (100%)");
      process.exit(0);
    } else {
      console.error("SOME TESTS FAILED");
      process.exit(1);
    }
  } catch (err) {
    console.error("Fatal error during test execution:", err);
    process.exit(1);
  }
}

main();
