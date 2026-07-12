# Failure Scenarios — RouteMaster

Resilience is designed in from the start. This document tracks how RouteMaster behaves when things go wrong.

## Fault Analysis
- **A dependency is unavailable** — how the system degrades and what the user sees.
- **A component crashes mid-operation** — what state is left behind and how it is recovered.
- **Traffic spike / overload** — how backpressure and limits protect the system.

## Recovery Strategy
- Components restart cleanly and resume from a known-good state.
- No partial operation is left in an inconsistent state.

## Chaos Testing
- Planned fault-injection to verify the recovery strategy holds under real failures.
