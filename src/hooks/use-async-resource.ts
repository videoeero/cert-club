import { useEffect, useState, type DependencyList } from "react";

export type AsyncResource<T> =
  | { status: "loading" }
  | { status: "ready"; data: T }
  | { status: "error"; error: Error };

function asError(reason: unknown): Error {
  return reason instanceof Error ? reason : new Error(String(reason));
}

export function useAsyncResource<T>(
  loader: () => Promise<T>,
  dependencies: DependencyList,
): AsyncResource<T> {
  const [resource, setResource] = useState<AsyncResource<T>>({
    status: "loading",
  });

  useEffect(() => {
    let active = true;
    setResource({ status: "loading" });

    void loader().then(
      (data) => {
        if (active) {
          setResource({ status: "ready", data });
        }
      },
      (reason: unknown) => {
        if (active) {
          setResource({ status: "error", error: asError(reason) });
        }
      },
    );

    return () => {
      active = false;
    };
    // `dependencies` is the caller-supplied re-run trigger for this generic
    // hook; `loader` itself is intentionally excluded so callers can pass an
    // inline closure without needing to memoize it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return resource;
}
