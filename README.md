# Watch SA

Watch SA is a South African reporting app with two watches in one place: **DumpWatch SA** for illegal dumping, and **WaterWatch SA** for leaks, dry taps, floods and sewer overflows.

Spot it. Snap it. Post it. The feed is public on the device that is running the app. There is no account. A display name is saved locally, and new posts start as **Pending approval**.

## DumpWatch SA

DumpWatch is for rubbish, rubble and waste left where it should not be.

A post is built in this order:

1. A scene video, up to 5 seconds. The camera opens first.
2. A photo of the car.
3. A photo of a person at the scene.
4. A close photo of the number plate.
5. A review of that evidence.
6. Title, description, street and province. The phone can fill the street and suggest a province from the current location.

A plate photo can suggest a registration. That check is a local stand-in, not a live camera scan. The person posting can accept the suggestion, correct it, or type the plate. The report stores the plate text, a normalized form, a confidence score and whether it was accepted.

DumpWatch posts show **Earn up to R300 per post**. The profile balance stays at **R0.00** until a report is proven true and a case leads to prosecution. Withdraw and Redeem are not available yet.

## WaterWatch SA

WaterWatch is for water and sewer failures. There is no number plate.

A post is:

1. A scene video, up to 5 seconds. This can be skipped if there is only a photo.
2. One picture of the leak, dry tap, flood or sewer overflow.
3. A review.
4. The kind of problem, then title, description, street and province.

The problem is one of:

- Sewer / sewage
- Leak / burst
- No water
- Flooding
- Other

WaterWatch posts show **Earn up to R20 per post**, on the same rule as DumpWatch: nothing is payable until a report is proven and prosecuted.

## Browsing

Home opens with a choice of DumpWatch or WaterWatch, a quick-post card for each, and the latest posts. Each watch has its own list, newest first, filtered by province or by all nine provinces:

Eastern Cape, Free State, Gauteng, KwaZulu-Natal, Limpopo, Mpumalanga, Northern Cape, North West and Western Cape.

Opening a report shows the title, description, evidence, date and time, province, street, coordinates when they were saved, prosecution status and emoji reactions. Dumping reports also show the plate result. Up to five emoji reactions can be added to a post.

## Your reports

Profile holds the display name, light or dark mode, the rewards balance, and the posts made on this phone. A report can be taken down only by requesting deletion and giving a reason. The request is marked on the post. The post stays visible.

A report can sit at pending approval, open, under review, proven, prosecuted, or deletion requested. Prosecution is tracked separately: not started, under review, proven, or prosecuted.

## What stays on the phone

Reports, the display name and the theme are stored on the device. The first launch includes sample posts from places such as Diepsloot, Soweto, eThekwini, Gqeberha, Kimberley, Mitchells Plain, Polokwane and Rustenburg, so the feeds are not empty.

There is no login and no live server. `supabase.example.sql` is a commented sketch of a later database. It is not connected to the app.

## Run it

This is an [Expo](https://expo.dev) app (SDK 57) using Expo Router.

```bash
npm install
npx expo start
```

`npm run web` opens it in a browser. `npm run android` and `npm run ios` build the native apps.
