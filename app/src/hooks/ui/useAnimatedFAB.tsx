import { useCallback, useState } from "react";
import { NativeScrollEvent, NativeSyntheticEvent } from "react-native";

export function useAnimatedFAB(initialExpanded = true) {
  const [expanded, setExpanded] = useState(initialExpanded);

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const shouldExpand = event.nativeEvent.contentOffset.y <= 0;

    setExpanded((prev) => (prev === shouldExpand ? prev : shouldExpand));
  }, []);

  return { expanded, onScroll };
}
