(**
---
title: Showcase
---
*)

(**


import { Tabs, TabItem } from '@astrojs/starlight/components';

<Tabs>
<TabItem label="Preview">

## Defining types

A `Shape` discriminated union covers the common 2D shapes. Each case carries
only the data it needs — no nulls, no inheritance.

*)

type Shape =
    | Circle of radius: float
    | Rectangle of width: float * height: float
    | Triangle of base': float * height: float

(*** hide ***)

    member this.Name =
        match this with
        | Circle _ -> "Circle"
        | Rectangle _ -> "Rectangle"
        | Triangle _ -> "Triangle"

let area shape =
    match shape with
    | Circle r -> System.Math.PI * r * r
    | Rectangle (w, h) -> w * h
    | Triangle (b, h) -> 0.5 * b * h

(**

## Computing area

Pattern matching on `Shape` gives us exhaustive dispatch. The compiler will warn
if a new case is added but the function is not updated.

*)

(**

## Trying it out

*)

let shapes = [ Circle 5.0; Rectangle (4.0, 6.0); Triangle (3.0, 8.0) ]

shapes
|> List.iter (fun shape ->
    let area = area shape
    printfn $"Area of %s{shape.Name} is %.2f{area}"
)

(**

</TabItem>
<TabItem label="Source">

This page has been generated using the following content:

```fs
*)

(*** verbatim ***)

(**
---
title: Demo
---
*)

(**

## Defining types

A `Shape` discriminated union covers the common 2D shapes. Each case carries
only the data it needs — no nulls, no inheritance.

*)

type Shape =
    | Circle of radius: float
    | Rectangle of width: float * height: float
    | Triangle of base': float * height: float

(*** hide ***)

    member this.Name =
        match this with
        | Circle _ -> "Circle"
        | Rectangle _ -> "Rectangle"
        | Triangle _ -> "Triangle"

let area shape =
    match shape with
    | Circle r -> System.Math.PI * r * r
    | Rectangle (w, h) -> w * h
    | Triangle (b, h) -> 0.5 * b * h

(**

## Computing area

Pattern matching on `Shape` gives us exhaustive dispatch. The compiler will warn
if a new case is added but the function is not updated.

*)

(**

## Trying it out

*)

let shapes = [ Circle 5.0; Rectangle (4.0, 6.0); Triangle (3.0, 8.0) ]

shapes
|> List.iter (fun shape ->
    let area = area shape
    printfn $"Area of %s{shape.Name} is %.2f{area}"
)

(*** end-verbatim ***)

(**
```

</TabItem>
</Tabs>

*)
