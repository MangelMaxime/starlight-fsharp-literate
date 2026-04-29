---
title: Literate Syntax
---

A literate file is an F# file that starts with a front-matter block:

```fs
(**
---
title: Demo
---
*)
```

Literate files are converted into MDX files before being processed by Starlight.

They are really handy because:

- You can use your code editor to get intellisense when writing the snippets
- Compile or run the files to check for errors

:::caution
Starlight-fsharp-literate only parses the files and transforms them into MDX.

This means that the code snippets are not executed or type-checked, so you won't get any compilation errors if your code is incorrect.
:::

## Commands

Any code between `(*** hide ***)` and the next doc comment will be hidden from the generated MDX output.

```fs
(*** hide ***)

// This code is hidden
let answer = 42

(**
From here the code is visible
*)
```

## MDX blocks

MDX blocks are defined by using `(** ... *)`. Anything between these tags is going to be treated as MDX.

```fs
(**
### This line will be converted to a header

This text is **strong** and this one is in *italic*
*)
```
