## Error

1. Peer dependencies:
    - npm error Could not resolve dependency:
    - npm error peer react-native-svg@"^6.2.1||^7.0.3" from react-native-svg-charts@5.4.0
    ```bash
    npm install expo@~51.0.28 --legacy-peer-deps
    ```

## Env

https://www.reddit.com/r/expo/comments/1feh09e/solution_for_using_environment_variables_in_expo/

### Step-by-Step Guide

Create a `.env` file in your project root and prefix your variables with EXPO_PUBLIC_. For example:

`EXPO_PUBLIC_SUPABASE_ANON_KEY="eyJ..."`

To access these variables in your project, use:

```javascript
const myVariable = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
console.log(`Proof that this loads: ${myVariable}`);
```

For better accessibility, you can create a config.ts file:

```javascript
const config = {
    MAPBOX_ACCESS_TOKEN: process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ?? "",
    SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
    SUPABASE_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
};

export default config;
```

Important Note:
`.env` files are not included in your EAS build by default.

### Using Environment Variables in EAS Builds

If you want to use your local environment variables during EAS builds:

Create the same variables in your Expo project’s secrets. You can find them here:
https://expo.dev/accounts/<username>/settings/secrets

Update your `eas.json` to tell EAS which secrets to use for specific branches (e.g., development, production):

```
"development": {
"autoIncrement": true,
"developmentClient": true,
"distribution": "internal",
"env": {
   "EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN": "$(EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN)",
   "EXPO_PUBLIC_SUPABASE_URL": "$(EXPO_PUBLIC_SUPABASE_URL)",
   "EXPO_PUBLIC_SUPABASE_ANON_KEY": "$(EXPO_PUBLIC_SUPABASE_ANON_KEY)"
  },
"channel": "development"
}
```

This tells EAS to look for `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` in the secrets and retrieve its value during the build.

Pushing Secrets Directly from the Command Line
To avoid manually setting up secrets in the Expo dashboard, you can push your .env file directly:

```bash
eas env:push --scope project --env-file .env`
```
```bash
 eas env:create --scope project --name SECRET_NAME --value secretvalue --type string
```

#### A Few Keynotes:

Using the `--local` flag will still use EAS Services, but make the build locally on your computer, instead of the cloud,
meaning you’ll still need to update EAS Secrets / JSON

You do not need to remove your `.env` from your `.gitignore`.

No need to add any configurations or environment variables to `app.config.js` or `app.json`.

:) 