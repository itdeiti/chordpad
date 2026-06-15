// Reference template for the native (Capacitor) adapter. Kept commented out because
// @capacitor/haptics is not a dependency of the web build — uncomment and wire it in
// create-haptics.ts when the Capacitor wrapper project is set up. No consumer changes
// are needed; this just plugs into the Haptics port (Open/Closed extension point).
//
// import { Haptics as Native, ImpactStyle, NotificationType } from "@capacitor/haptics";
// import { DEFAULT_PATTERN, type HapticPattern, type Haptics } from "./haptics";
//
// export class CapacitorHaptics implements Haptics {
//   trigger(pattern: HapticPattern = DEFAULT_PATTERN): void {
//     switch (pattern) {
//       case "selection":
//         void Native.selectionStart().then(() => Native.selectionEnd());
//         return;
//       case "light":
//         void Native.impact({ style: ImpactStyle.Light });
//         return;
//       case "medium":
//         void Native.impact({ style: ImpactStyle.Medium });
//         return;
//       case "heavy":
//         void Native.impact({ style: ImpactStyle.Heavy });
//         return;
//       case "success":
//         void Native.notification({ type: NotificationType.Success });
//         return;
//       case "warning":
//         void Native.notification({ type: NotificationType.Warning });
//         return;
//       case "error":
//         void Native.notification({ type: NotificationType.Error });
//         return;
//     }
//   }
// }

export {};
