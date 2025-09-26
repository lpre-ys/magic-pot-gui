import type {
  ForgeConfig,
  ResolvedForgeConfig,
} from "@electron-forge/shared-types";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { VitePlugin } from "@electron-forge/plugin-vite";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { FuseV1Options, FuseVersion } from "@electron/fuses";
import fs from "node:fs/promises";
import fssync from "node:fs";
import path from "node:path";

const config: ForgeConfig = {
  packagerConfig: {
    name: "magic_pot",
    icon: "./icon/icon",
    asar: true,
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({}),
    new MakerZIP({}, ["darwin", "win32"]),
    new MakerRpm({}),
    new MakerDeb({}),
  ],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: "src/main.ts",
          config: "vite.main.config.ts",
          target: "main",
        },
        {
          entry: "src/preload.ts",
          config: "vite.preload.config.ts",
          target: "preload",
        },
      ],
      renderer: [
        {
          name: "main_window",
          config: "vite.renderer.config.ts",
        },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
  hooks: {
    // package（= 各プラットフォームの“素のアプリ”が出力された直後）に走る
    async postPackage(_forgeCfg: ResolvedForgeConfig, opts) {
      const myLicenseSrc = path.resolve(__dirname, "LICENSE");
      const hasMyLicense = fssync.existsSync(myLicenseSrc);
      const myReadmeSrc = path.resolve(__dirname, "readme.txt");
      const hasMyReadme = fssync.existsSync(myReadmeSrc);

      for (const outDir of opts.outputPaths) {
        const electronLicense = path.join(outDir, "LICENSE");
        const electronLicenseRenamed = path.join(outDir, "LICENSE.electron");

        // Electron の LICENSE があるならリネーム
        if (fssync.existsSync(electronLicense)) {
          // 既に存在してたら上書き防止のため削除 or 上書き
          if (fssync.existsSync(electronLicenseRenamed)) {
            await fs.unlink(electronLicenseRenamed);
          }
          await fs.rename(electronLicense, electronLicenseRenamed);
        }

        // 自分の GPL LICENSE を “LICENSE” 名で配置
        if (hasMyLicense) {
          await fs.copyFile(myLicenseSrc, path.join(outDir, "LICENSE"));
        }
        if (hasMyReadme) {
          await fs.copyFile(myReadmeSrc, path.join(outDir, "readme.txt"));
        }
      }
    },
  },
};

export default config;
