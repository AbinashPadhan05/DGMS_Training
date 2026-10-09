import { useEffect, useState } from "react";
import { loadJSON, saveJSON } from "../utils/storage";

// useState that mirrors its value to localStorage.
// getInitial(saved) receives whatever was stored (or null) and returns the starting state.
export default function usePersistentState(key, getInitial) {
  const [state, setState] = useState(() => getInitial(loadJSON(key)));

  useEffect(() => {
    saveJSON(key, state);
  }, [key, state]);

  return [state, setState];
}
