export function getTestWorkerId(): string {
  return process.env.VITEST_POOL_ID ?? '1';
}

export function getTestSchemaName(): string {
  return `test_schema_${getTestWorkerId()}`;
}
