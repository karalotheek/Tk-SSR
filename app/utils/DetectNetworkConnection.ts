import { windowRef } from "@services/window";

export const DetectNetworkConnection = () => {
    if (windowRef && navigator.onLine) return true;
    else return false;
}