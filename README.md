# HAI!
Typescript!

Pretty much a render+mouse module with an archetype extension (`class Archetype.properties = {[p:Prop]:any}`). A joyous mix of object oriented, functional and component based programming I guess.


# Features

Async asset loading that awaits full download before doing anything with it (YAY!).


Built-in interchangeability of shaders (OMGWTFBBQ!).


Extendable through the `Archetype` + subclasses properties (`{[propFromAnEnum:P.Prop]:any}`)


`Archetypes` go no deeper than ``rootArchetype -> subType -> subsubType`` to avoid inheritance labyrinths.


# HOW TO
## First setup the environment
Node.js (it's on the web, find it)


Webpack (through node's npm)


Python (preferably in your path)

## Now time to have fun:
```
>> 
>> startServing
>> webpack --watch
>> start chrome /html/z.html
```

