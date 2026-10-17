import { Code2 } from "lucide-react";
import type { IconType } from "react-icons";
import {
  SiC,
  SiCplusplus,
  SiSharp,
  SiCss,
  SiDart,
  SiDocker,
  SiElixir,
  SiErlang,
  SiFirebase,
  SiGnubash,
  SiGo,
  SiGraphql,
  SiHaskell,
  SiHtml5,
  SiJavascript,
  SiJson,
  SiJupyter,
  SiKotlin,
  SiLua,
  SiMarkdown,
  SiMysql,
  SiNodedotjs,
  SiPhp,
  SiPostgresql,
  SiPython,
  SiR,
  SiReact,
  SiRuby,
  SiRust,
  SiScala,
  SiSpring,
  SiSqlite,
  SiSwift,
  SiTypescript,
  SiVuedotjs,
  SiWebassembly,
  SiYaml,
  SiZig,
} from "react-icons/si";

import { cn } from "@/lib/utils";

type LanguageConfig = {
  Icon: IconType;
  bg: string;
  iconClass: string;
};

const LANGUAGE_MAP: Record<string, LanguageConfig> = {
  JavaScript: {
    Icon: SiJavascript,
    bg: "bg-[#F7DF1E]",
    iconClass: "text-[#323330]",
  },

  TypeScript: {
    Icon: SiTypescript,
    bg: "bg-[#3178C6]",
    iconClass: "text-white",
  },

  Java: {
    Icon: Code2,
    bg: "bg-[#ED8B00]",
    iconClass: "text-white",
  },

  Python: {
    Icon: SiPython,
    bg: "bg-[#3776AB]",
    iconClass: "text-white",
  },

  "C++": {
    Icon: SiCplusplus,
    bg: "bg-[#00599C]",
    iconClass: "text-white",
  },

  C: {
    Icon: SiC,
    bg: "bg-[#A8B9CC]",
    iconClass: "text-[#1A1A1A]",
  },

  "C#": {
    Icon: SiSharp,
    bg: "bg-[#512BD4]",
    iconClass: "text-white",
  },

  HTML: {
    Icon: SiHtml5,
    bg: "bg-[#E34F26]",
    iconClass: "text-white",
  },

  CSS: {
    Icon: SiCss,
    bg: "bg-[#1572B6]",
    iconClass: "text-white",
  },

  React: {
    Icon: SiReact,
    bg: "bg-[#61DAFB]",
    iconClass: "text-[#20232A]",
  },

  Vue: {
    Icon: SiVuedotjs,
    bg: "bg-[#4FC08D]",
    iconClass: "text-white",
  },

  PHP: {
    Icon: SiPhp,
    bg: "bg-[#777BB4]",
    iconClass: "text-white",
  },

  Ruby: {
    Icon: SiRuby,
    bg: "bg-[#CC342D]",
    iconClass: "text-white",
  },

  Rust: {
    Icon: SiRust,
    bg: "bg-[#000000]",
    iconClass: "text-white",
  },

  Go: {
    Icon: SiGo,
    bg: "bg-[#00ADD8]",
    iconClass: "text-white",
  },

  Kotlin: {
    Icon: SiKotlin,
    bg: "bg-[#7F52FF]",
    iconClass: "text-white",
  },

  Swift: {
    Icon: SiSwift,
    bg: "bg-[#F05138]",
    iconClass: "text-white",
  },

  Dart: {
    Icon: SiDart,
    bg: "bg-[#0175C2]",
    iconClass: "text-white",
  },

  Scala: {
    Icon: SiScala,
    bg: "bg-[#DC322F]",
    iconClass: "text-white",
  },

  Lua: {
    Icon: SiLua,
    bg: "bg-[#000080]",
    iconClass: "text-white",
  },

  R: {
    Icon: SiR,
    bg: "bg-[#276DC3]",
    iconClass: "text-white",
  },

  SQL: {
    Icon: SiSqlite,
    bg: "bg-[#003B57]",
    iconClass: "text-white",
  },

  MySQL: {
    Icon: SiMysql,
    bg: "bg-[#4479A1]",
    iconClass: "text-white",
  },

  PostgreSQL: {
    Icon: SiPostgresql,
    bg: "bg-[#4169E1]",
    iconClass: "text-white",
  },

  Bash: {
    Icon: SiGnubash,
    bg: "bg-[#4EAA25]",
    iconClass: "text-white",
  },

  Shell: {
    Icon: SiGnubash,
    bg: "bg-[#4EAA25]",
    iconClass: "text-white",
  },

  Dockerfile: {
    Icon: SiDocker,
    bg: "bg-[#2496ED]",
    iconClass: "text-white",
  },

  Docker: {
    Icon: SiDocker,
    bg: "bg-[#2496ED]",
    iconClass: "text-white",
  },

  GraphQL: {
    Icon: SiGraphql,
    bg: "bg-[#E10098]",
    iconClass: "text-white",
  },

  Elixir: {
    Icon: SiElixir,
    bg: "bg-[#4B275F]",
    iconClass: "text-white",
  },

  Erlang: {
    Icon: SiErlang,
    bg: "bg-[#A90533]",
    iconClass: "text-white",
  },

  Haskell: {
    Icon: SiHaskell,
    bg: "bg-[#5E5086]",
    iconClass: "text-white",
  },

  Jupyter: {
    Icon: SiJupyter,
    bg: "bg-[#F37626]",
    iconClass: "text-white",
  },

  JSON: {
    Icon: SiJson,
    bg: "bg-[#000000]",
    iconClass: "text-white",
  },

  Markdown: {
    Icon: SiMarkdown,
    bg: "bg-[#000000]",
    iconClass: "text-white",
  },

  YAML: {
    Icon: SiYaml,
    bg: "bg-[#CB171E]",
    iconClass: "text-white",
  },

  WebAssembly: {
    Icon: SiWebassembly,
    bg: "bg-[#654FF0]",
    iconClass: "text-white",
  },

  Zig: {
    Icon: SiZig,
    bg: "bg-[#F7A41D]",
    iconClass: "text-[#000000]",
  },

  Firebase: {
    Icon: SiFirebase,
    bg: "bg-[#FFCA28]",
    iconClass: "text-[#1A1A1A]",
  },

  "Node.js": {
    Icon: SiNodedotjs,
    bg: "bg-[#339933]",
    iconClass: "text-white",
  },

  Spring: {
    Icon: SiSpring,
    bg: "bg-[#6DB33F]",
    iconClass: "text-white",
  },
};

export function LanguageIcon({
  language,
  className,
}: {
  language: string;
  className?: string;
}) {
  const config = LANGUAGE_MAP[language];

  if (!config) {
    return (
      <div
        className={cn(
          "flex size-8 items-center justify-center rounded-md bg-muted",
          className
        )}
      >
        <Code2 className="size-4 text-muted-foreground" />
      </div>
    );
  }

  const { Icon, bg, iconClass } = config;

  return (
    <div
      className={cn(
        "flex size-8 items-center justify-center rounded-md",
        bg,
        className
      )}
    >
      <Icon className={cn("size-4", iconClass)} />
    </div>
  );
}