import { describe, test, expect } from "vitest";
import { tryParse } from "../src/parser";
import type { ParseResult } from "../src/parser";
import path from "node:path";


const FM = `(**\n---\ntitle: Test\n---\n*)`;

const __dirname = import.meta.dirname;

const expectToMatchFile = async (result: ParseResult | null, testName: string) => {
    const snapshotFile = testName.replace(/ /g, "_") + ".md"
    const destination = path.join(__dirname, "__snapshots__", snapshotFile)

    await expect(result!.body).toMatchFileSnapshot(destination);
}

describe("tryParse", () => {
    test("returns null when no frontmatter block", () => {
        expect(tryParse("let x = 1")).toBeNull();
        expect(tryParse("(** No frontmatter here *)")).toBeNull();
        expect(tryParse(`(**
---
title: My Title
**)`)).toBeNull();
    });

    test("parses frontmatter key/value pairs", () => {
        const result = tryParse(`(**
---
title: My Page
description: Some description
---
*)`);

        expect(result).toMatchInlineSnapshot(`
          {
            "body": "",
            "data": {
              "description": "Some description",
              "title": "My Page",
            },
            "frontMatter": "---
          title: My Page
          description: Some description
          ---",
          }
        `);
    });

    test("produces empty body when nothing follows frontmatter", () => {
        const result = tryParse(FM);

        expect(result).toMatchInlineSnapshot(`
          {
            "body": "",
            "data": {
              "title": "Test",
            },
            "frontMatter": "---
          title: Test
          ---",
          }
        `);
    });

    test("wraps code lines in F# code blocks", async (t) => {
        const result = tryParse(`${FM}

open System

DateTime.Now |> printfn "%A"
`);

        await expectToMatchFile(result, t.task.name)
    })


    test("hide commands works", async t => {
        const result = tryParse(`${FM}

(*** hide ***)

#I "../../src/bin/Debug/netstandard2.0"
#r "Thoth.Json.dll"

open Thoth.Json

(**

An encoder is a function that takes an F# value and transforms it into a JSON value.

**Example of an encoder:**

*)

let json =
    Encode.object [
        Encode.nil
    ]
`
        )

        await expectToMatchFile(result, t.task.name)

    })

    test("multiples hides commands works", async t => {
        const result = tryParse(`${FM}

(*** hide ***)

let a = 1
let b = 2

(**

Add function:

*)

let add v1 v2 =
    v1 + v2

(*** hide ***)

let answer = 2

(**

You can then verify it works

*)

(add a b) = 2
`)

        await expectToMatchFile(result, t.task.name)
    })

    test("single line markdown comments works", async t => {
        const result = tryParse(`${FM}

(** This is a **single line** *)
        `)

        await expectToMatchFile(result, t.task.name)
    })

    test("text on closing comment works", async t => {
        const result = tryParse(`${FM}

(** This is the first line

This is a second line *)`)

        await expectToMatchFile(result, t.task.name)
    })

    test("hide command at the end of the file works", async t => {
        const result = tryParse(`${FM}

let a = 1

(**

Variable declaration

*)

(*** hide ***)`)

        await expectToMatchFile(result, t.task.name)
    })

    test("consecutive hide command keep hidding", async t => {

        const result = tryParse(`${FM}

(*** hide ***)

(*** hide ***)

(*** hide ***)


(*** hide ***)

let a = 1

(**

Variable declaration

*)`)

        await expectToMatchFile(result, t.task.name)
    })

    test("prose and code without hide blocks", async t => {
        const result = tryParse(`${FM}

(**

Introduction paragraph.

*)

let x = 1

let y = 2

(**

Explanation of the code above.

*)

let z = x + y
`)

        await expectToMatchFile(result, t.task.name)
    })

    test("prose only body", async t => {
        const result = tryParse(`${FM}

(**

This file has no code blocks,
only markdown prose.

*)
`)

        await expectToMatchFile(result, t.task.name)
    })

    test("empty prose block produces nothing", () => {
        const result = tryParse(`${FM}

(** *)

let x = 1
`)

        expect(result!.body).toBe("```fsharp\nlet x = 1\n```")
    })

    test("verbatim block passes content through as-is", async (t) => {
        const result = tryParse(`${FM}

(**

Some prose before.

*)

(*** verbatim ***)

import { Tabs, TabItem } from '@astrojs/starlight/components'

<Tabs>
  <TabItem label="F#">Hello</TabItem>
</Tabs>

(*** end-verbatim ***)

let x = 1
`)

        await expectToMatchFile(result, t.task.name)
    })

    test("verbatim block without closing tag includes rest of file", async (t) => {
        const result = tryParse(`${FM}

(**

Prose before.

*)

(*** verbatim ***)

import { Tabs, TabItem } from '@astrojs/starlight/components'

<Tabs>
  <TabItem label="F#">Hello</TabItem>
</Tabs>

(**

This is a test of verbatim with a comment
*)
`)

        await expectToMatchFile(result, t.task.name)
    })
});
