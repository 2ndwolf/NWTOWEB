# HAI!
Typescript!

Pretty much a render+mouse module with an archetype extension (`class Archetype.properties = {[p:Prop]:any}`). A joyous mix of object oriented, functional and component based programming I guess.


# Features
Async asset loading that awaits full download before doing anything with it (YAY!).

Built-in interchangeability of shaders (OMGWTFBBQ!) that will automagically attach shader properties to shader program. (See below)

Extendable through the `Archetype` + subclasses properties (`{[propFromAnEnum:P.Prop]:any}`) — some properties are built in (``P.u.shaderProperty`` / ``P.go.gameObjectProperty``) custom properties might be added and look like `P.cgo.customGameObjectProperty` and `P.cu.customShaderProperty`.

`Archetypes` go no deeper than ``rootArchetype -> subType -> subsubType`` to avoid inheritance going wild.

#### THAT'S IT!


# HOW TO
## First setup the environment
Node.js  (it's on the web, find it!)

Python (preferably in your path)

## Now time to have fun:
```
>> cd NWTOWEB
>> npm install
>> startServing
>> webpack --watch
>> start chrome /html/z.html
```

