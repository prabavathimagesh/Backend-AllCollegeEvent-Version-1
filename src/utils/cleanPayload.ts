export function cleanPayload(payload: any) {
  return Object.fromEntries(
    Object.entries(payload).filter(
      ([_, value]) => value !== undefined && value !== null
    )
  );
}
