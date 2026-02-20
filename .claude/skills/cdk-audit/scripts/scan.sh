#!/bin/bash
# CDK Quick Audit Scanner
# Usage: bash scripts/scan.sh [project-root]
#
# Scans an Angular project and produces a summary of CDK usage and opportunities.

ROOT="${1:-.}"

echo "========================================="
echo " CDK Audit Scanner"
echo "========================================="
echo ""

# 1. Check installation
echo "--- Package Versions ---"
if [ -f "$ROOT/package.json" ]; then
  grep -E '"@angular/(core|cdk|material)"' "$ROOT/package.json" | sed 's/[",]//g' | sed 's/^[ ]*//'
else
  echo "ERROR: No package.json found at $ROOT"
  exit 1
fi
echo ""

# 2. CDK module usage breakdown
echo "--- CDK Modules in Use ---"
MODULES_USED=0
MODULES_TOTAL=21
for module in a11y accordion bidi clipboard coercion collections dialog drag-drop layout listbox menu observers overlay platform portal scrolling stepper table text-field tree testing; do
  count=$(grep -r "from '@angular/cdk/$module'" --include="*.ts" "$ROOT/src" 2>/dev/null | grep -v "node_modules" | wc -l)
  if [ "$count" -gt 0 ]; then
    echo "  [USED] cdk/$module ($count imports)"
    MODULES_USED=$((MODULES_USED + 1))
  fi
done
echo ""
echo "  Score: $MODULES_USED / $MODULES_TOTAL modules in use"
echo ""

# 3. Opportunity detection
echo "--- Potential CDK Opportunities ---"
echo ""

# Focus management
FOCUS_CUSTOM=$(grep -rn "addEventListener.*focus\|addEventListener.*blur\|tabindex.*keydown\|event\.key.*Tab" --include="*.ts" "$ROOT/src" 2>/dev/null | grep -v "node_modules\|\.spec\." | wc -l)
if [ "$FOCUS_CUSTOM" -gt 0 ]; then
  echo "  [CRITICAL] Custom focus management: $FOCUS_CUSTOM occurrences (use cdk/a11y FocusTrap, FocusMonitor)"
fi

# Missing focus trap in dialogs
DIALOGS=$(grep -rl 'role="dialog"\|\.modal-\|\.dialog-' --include="*.html" "$ROOT/src" 2>/dev/null | grep -v "node_modules" | wc -l)
FOCUS_TRAPS=$(grep -rl "cdkTrapFocus\|CdkTrapFocus\|FocusTrap" --include="*.ts" --include="*.html" "$ROOT/src" 2>/dev/null | grep -v "node_modules" | wc -l)
if [ "$DIALOGS" -gt "$FOCUS_TRAPS" ]; then
  echo "  [CRITICAL] Dialogs without focus traps: ~$((DIALOGS - FOCUS_TRAPS)) (use cdkTrapFocus)"
fi

# Keyboard navigation
KB_NAV=$(grep -rn "ArrowUp\|ArrowDown\|ArrowLeft\|ArrowRight" --include="*.ts" "$ROOT/src" 2>/dev/null | grep -v "node_modules\|\.spec\.\|cdk\|@angular" | wc -l)
if [ "$KB_NAV" -gt 0 ]; then
  echo "  [HIGH] Custom keyboard navigation: $KB_NAV occurrences (use ListKeyManager, cdkListbox, or cdkMenu)"
fi

# Custom overlay/positioning
CUSTOM_POS=$(grep -rn "getBoundingClientRect\|position.*fixed.*top\|position.*absolute.*top" --include="*.ts" "$ROOT/src" 2>/dev/null | grep -v "node_modules\|\.spec\." | wc -l)
if [ "$CUSTOM_POS" -gt 0 ]; then
  echo "  [HIGH] Custom positioning logic: $CUSTOM_POS occurrences (use cdk/overlay)"
fi

# Custom drag and drop
CUSTOM_DRAG=$(grep -rn "mousedown.*mousemove\|touchstart.*touchmove\|draggable.*true" --include="*.ts" --include="*.html" "$ROOT/src" 2>/dev/null | grep -v "node_modules\|\.spec\.\|cdkDrag" | wc -l)
if [ "$CUSTOM_DRAG" -gt 0 ]; then
  echo "  [HIGH] Custom drag implementation: $CUSTOM_DRAG occurrences (use cdk/drag-drop)"
fi

# Custom scroll tracking
CUSTOM_SCROLL=$(grep -rn "addEventListener.*scroll\|fromEvent.*scroll\|HostListener.*scroll" --include="*.ts" "$ROOT/src" 2>/dev/null | grep -v "node_modules\|\.spec\.\|cdkScrollable" | wc -l)
if [ "$CUSTOM_SCROLL" -gt 0 ]; then
  echo "  [MEDIUM] Custom scroll listeners: $CUSTOM_SCROLL occurrences (use cdkScrollable + ScrollDispatcher)"
fi

# Manual resize
CUSTOM_RESIZE=$(grep -rn "addEventListener.*resize\|fromEvent.*resize\|window\.innerWidth\|window\.innerHeight" --include="*.ts" "$ROOT/src" 2>/dev/null | grep -v "node_modules\|\.spec\." | wc -l)
if [ "$CUSTOM_RESIZE" -gt 0 ]; then
  echo "  [MEDIUM] Manual resize handling: $CUSTOM_RESIZE occurrences (use ViewportRuler or BreakpointObserver)"
fi

# Custom clipboard
CUSTOM_CLIP=$(grep -rn "navigator\.clipboard\|execCommand.*copy" --include="*.ts" "$ROOT/src" 2>/dev/null | grep -v "node_modules" | wc -l)
if [ "$CUSTOM_CLIP" -gt 0 ]; then
  echo "  [LOW] Custom clipboard: $CUSTOM_CLIP occurrences (use cdk/clipboard)"
fi

# Custom browser detection
CUSTOM_UA=$(grep -rn "navigator\.userAgent\|navigator\.platform" --include="*.ts" "$ROOT/src" 2>/dev/null | grep -v "node_modules" | wc -l)
if [ "$CUSTOM_UA" -gt 0 ]; then
  echo "  [LOW] Custom browser detection: $CUSTOM_UA occurrences (use cdk/platform)"
fi

# Custom textarea autosize
CUSTOM_AUTOSIZE=$(grep -rn "scrollHeight.*textarea\|textarea.*style\.height\|autosize" --include="*.ts" "$ROOT/src" 2>/dev/null | grep -v "node_modules\|cdkTextareaAutosize" | wc -l)
if [ "$CUSTOM_AUTOSIZE" -gt 0 ]; then
  echo "  [MEDIUM] Custom textarea autosize: $CUSTOM_AUTOSIZE occurrences (use cdkTextareaAutosize)"
fi

# Custom MutationObserver
CUSTOM_MO=$(grep -rn "new MutationObserver" --include="*.ts" "$ROOT/src" 2>/dev/null | grep -v "node_modules" | wc -l)
if [ "$CUSTOM_MO" -gt 0 ]; then
  echo "  [LOW] Custom MutationObserver: $CUSTOM_MO occurrences (use cdkObserveContent)"
fi

# Large lists without virtual scroll
LARGE_NGFOR=$(grep -rn "@for\|ngFor" --include="*.html" "$ROOT/src" 2>/dev/null | grep -v "node_modules\|cdkVirtualFor" | wc -l)
if [ "$LARGE_NGFOR" -gt 20 ]; then
  echo "  [INFO] $LARGE_NGFOR iteration loops found. Review if any iterate > 100 items (candidate for virtual scroll)"
fi

echo ""
echo "--- Anti-Patterns in Existing CDK Usage ---"

# Overlay without dispose
OVERLAY_CREATE=$(grep -rl "overlay\.create" --include="*.ts" "$ROOT/src" 2>/dev/null | grep -v "node_modules")
for f in $OVERLAY_CREATE; do
  if ! grep -q "dispose\|detach\|DestroyRef\|ngOnDestroy" "$f"; then
    echo "  [HIGH] OverlayRef not disposed: $f"
  fi
done

# FocusMonitor without stopMonitoring
FM_MONITOR=$(grep -rl "focusMonitor\.monitor\|_focusMonitor\.monitor" --include="*.ts" "$ROOT/src" 2>/dev/null | grep -v "node_modules")
for f in $FM_MONITOR; do
  if ! grep -q "stopMonitoring" "$f"; then
    echo "  [MEDIUM] FocusMonitor leak: $f"
  fi
done

# cdkListbox without aria-label
LISTBOX_NO_LABEL=$(grep -rn "cdkListbox" --include="*.html" "$ROOT/src" 2>/dev/null | grep -v "aria-label" | grep -v "node_modules")
if [ -n "$LISTBOX_NO_LABEL" ]; then
  echo "  [CRITICAL] cdkListbox without aria-label:"
  echo "$LISTBOX_NO_LABEL" | head -5
fi

echo ""
echo "========================================="
echo " Scan Complete"
echo "========================================="