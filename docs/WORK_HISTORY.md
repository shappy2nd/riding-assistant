# Riding Assistant — Work conversation reconstruction

This document captures the verified product behavior and development history copied from the original ChatGPT Work conversation by the repository owner. It is a migration reference, not source code.

## Production URL

- https://riding-assistant.mose85.chatgpt.site

## Product goal

A mobile/PC web riding assistant for a road cyclist riding mainly around Seoul/Han River, with frequent route/schedule suggestions and Strava-based activity history.

## Original requirements captured from Work

- Mobile and PC web app
- Strava automatic integration
- Weekday ride suggestions before leaving work
- Real-time weather/date/area header
- Riding score and weather-dependent message
- Course recommendations around Dorimcheon, Anyangcheon, Hangang Bridge area
- Route builder with start / destination / waypoints
- Saved routes and recommended routes
- GPX import
- Ride mode with navigation / tracking
- Record history from device and Strava
- Settings including saved places and Strava

## Confirmed tab structure

### Today
- Current date / region / weather
- Riding index
- Weather-dependent message
- Button linking to recommended course

### Courses
- Route setup
- Saved routes
- Recommended routes and category filters
- GPX import

### Ride
- Real-time route guidance / ride information

### Records
- Device and Strava ride results
- Per-ride route map thumbnail
- Device GPS track rendering
- Strava `summary_polyline` rendering
- Empty-state text when route data is absent
- Weekly cumulative distance/time
- Monthly cumulative distance/time
- Annual cumulative distance/time
- Monthly calendar with bicycle icon on ride days
- Multiple rides on one day shown as ride count
- Previous/next month navigation and Today return
- Device + Strava duplicate ride rule: within 10 minutes and distance difference within 0.2 km => count once

### Settings
- Saved locations / synchronization / Strava settings

## Strava integration history

- Strava developer application was created
- App icon registration was completed after repeated setup errors
- Client secret was checked against production configuration and reported as matching
- OAuth connection ultimately succeeded
- Existing implementation references Strava route polyline data for activity-map thumbnails

## Kakao integration history

- Kakao Maps integration was used for route display and activity-map thumbnails
- A separate browser-only Kakao key encryptor helper exists in the ChatGPT Library

## UI / behavior decisions preserved from prior work

- Today and Courses tabs were separated
- Weather panel should not repeat on Records or Settings
- Clicking the top logo returns to Today
- Mobile layout is a first-class requirement
- Record-map cards use a wider map presentation on mobile
- Only visible record cards load their maps for performance

## Migration status

- GitHub repository created: `shappy2nd/riding-assistant`
- Repository is private
- Secret-safe `.gitignore` and `.env.example` are present
- Original ChatGPT Site source files have NOT yet been exported or recovered
- Do not treat reconstructed code as original unless verified against an exported source bundle or the original Work project

## Next verification target

Recover one of the following from the original ChatGPT Work/Site project:

1. source-code export / ZIP,
2. project file tree plus file contents,
3. generated build artifact with source maps,
4. direct GitHub sync if the Site editor exposes one.

Until then, this document is the canonical verified feature specification for reconstruction.
