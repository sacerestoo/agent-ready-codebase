export type SingletonFileRule = Readonly<{
  name: string;
  expectedPath: string;
  prefix: string;
  extensions: readonly string[];
}>;

export type ArchitectureConfig<
  Directories extends Readonly<Record<string, string>> = Record<string, string>,
> = Readonly<{
  directories: Directories;
  applicationDirectoryKeys: readonly (keyof Directories & string)[];
  webDirectoryKeys: readonly (keyof Directories & string)[];
  databaseModulePathPatterns: readonly string[];
  databaseImporterPathPatterns: readonly string[];
  sourceExtensions: readonly string[];
  additionalRootDirectories: readonly string[];
  generatedDirectories: readonly string[];
  featureSubdirectories: readonly string[];
  featureUi: Readonly<{
    directory: string;
    extensions: readonly string[];
  }>;
  singletonFiles: readonly SingletonFileRule[];
  packageManifest: string;
  rejectWorkspaces: boolean;
  cssDirectory: string;
  dependencyCruiserConfig: string;
  typeScriptConfig: string;
}>;
