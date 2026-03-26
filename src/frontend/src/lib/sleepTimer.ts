let intervalId: ReturnType<typeof setInterval> | null = null;

export function startSleepTimer(
  minutes: number,
  onExpire: () => void,
  onTick: (remaining: number) => void,
): void {
  if (intervalId) clearInterval(intervalId);
  let remaining = Math.floor(minutes * 60);
  onTick(remaining);

  intervalId = setInterval(() => {
    remaining--;
    onTick(remaining);
    if (remaining <= 0) {
      clearSleepTimer();
      onExpire();
    }
  }, 1000);
}

export function clearSleepTimer(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
