An encoder is a function that takes an F# value and transforms it into a JSON value.

**Example of an encoder:**

```fsharp
let json =
    Encode.object [
        Encode.nil
    ]
```