import * as ecs from 'shared/lib/ecs'

// import * as animation from 'shared/ecs/components/animation'
import * as archetype from 'shared/ecs/components/archetype'
import * as event from 'shared/ecs/components/event'
import * as flag from 'shared/ecs/components/flag'
import * as gameobject from 'shared/ecs/components/gameobject'
import * as map from 'shared/ecs/components/map'


//#!if CLIENT_SIDE
import Image from 'shared/lib/kha/kha/Image'
import * as render from 'shared/ecs/components/render'
//@ts-ignore
import world from 'client/engine/world'
//#!elseif SERVER_SIDE
//@ts-ignore
import world from 'server/engine/world'
//#!endif

export default class apiUtils {

//#!if CLIENT_SIDE
    /**
   * Draws part of or a whole image in a given render target component
   * 
   * @param renderTarget render.RenderTargetsComponent The render target component to use
   * @param texture Image The texture to draw from
   * @param startX number The x offset on the texture
   * @param startY number The y offset on the texture
   * @param width number The width on the texture
   * @param height number The height on the texture
   */
  public static drawSprite = (renderTarget: render.RenderTargetsComponent, texture: Image, startX: number, startY: number, width: number, height: number) => {
    const g2 = renderTarget.targets[0].get_g2()
    g2.begin(true, 0x000000)
    g2.flush()
        g2.drawSubImage(texture, 0, 0, startX, startY, width, height)
    g2.end()
  }
//#!endif


  /**
   * Puts one, zero or minus one on members of a size two array depending on the direction that was given so that vector[0] equals -1 if character is looking left and so on
   * 
   * @param direction gameobject.CharacterDirection A CharacterDirection / DirectionComponent.dir
   */
  public static getVectorFromDir = (direction: gameobject.CharacterDirection) => {
    let vector = new Array(2)
    if(direction == gameobject.CharacterDirection.Up){
      vector[0] = 0
      vector[1] = -1
    } else if (direction == gameobject.CharacterDirection.Left){
      vector[0] = -1
      vector[1] = 0
    } else if (direction == gameobject.CharacterDirection.Down){
      vector[0] = 0
      vector[1] = 1
    } else if (direction == gameobject.CharacterDirection.Right){
      vector[0] = 1
      vector[1] = 0
    }

    return vector
  }

  /**
   * Checks collisions against all in collidables and cullableNPCs quadtrees, moves the entity to the vector's position if not onWall, adds an onWall flag if player is against a blocking tile(s), puts the tile walked on in tileUnder component if present
   * 
   * @param entity The entity to check the collisions against
   * @param vector The position to check against (new position)
   * @optional `delta` The number of seconds passed (in the previous loop?) - unused
   */
  public static collisions = (entity: ecs.Entity, vector: Array<number>, delta?: number) => {
    const positionComponent = entity.get(gameobject.PositionComponent)
    const collisionBoxComponent = entity.get(gameobject.CollisionBoxComponent)

    const collidedTiles = world.spatialTree.collidables
      .colliding({
        x: vector[0] + collisionBoxComponent.originX,
        y: vector[1] + collisionBoxComponent.originY,
        width: collisionBoxComponent.width,
        height: collisionBoxComponent.height
      }) as any

    const collidedNPCs = world.spatialTree.cullableNPCs
      .colliding({
        x: vector[0] + collisionBoxComponent.originX,
        y: vector[1] + collisionBoxComponent.originY,
        width: collisionBoxComponent.width,
        height: collisionBoxComponent.height
      }) as any

    const collided = collidedTiles.concat(collidedNPCs)

    if(collidedNPCs.length > 0){
      for(let i in collidedNPCs){
        let NPCEntity: ecs.Entity

        NPCEntity = world.engine.getEntity(collidedNPCs[i].entityId)
        NPCEntity.add(new event.TouchedByPlayer(entity.getId()))
      }
    }
    
    if(entity.has(flag.onWallComponent)){
      entity.remove(flag.onWallComponent)
    }

    if(collided.length == 0){
      positionComponent.x = vector[0]
      positionComponent.y = vector[1]
      if(entity.has(map.TileUnderComponent))
        entity.get(map.TileUnderComponent).tileUnder = map.NWTileTypes.nonBlocking

    } else {
      

      if(apiUtils.ifNoneEqualMultTiles(
          collided.filter((collidable: map.CollidableQuad) => {
          return (!(collidable.y + collidable.height <= positionComponent.y + collisionBoxComponent.originY ||
                  collidable.y >= positionComponent.y + collisionBoxComponent.originY + collisionBoxComponent.height))
                  }),
          [map.NWTileTypes.blocking, map.NWTileTypes.throwThrough, map.NWTileTypes.jumpStone, map.NWTileTypes.jumpThrough])){
        positionComponent.x = vector[0]
      } else {
        vector[0] = positionComponent.x
      }

      if(apiUtils.ifNoneEqualMultTiles(
          collided.filter((collidable: map.CollidableQuad) => {
          return !(collidable.x + collidable.width <= positionComponent.x + collisionBoxComponent.originX ||
                  collidable.x >= positionComponent.x + collisionBoxComponent.originX + collisionBoxComponent.width)
                  }),
          [map.NWTileTypes.blocking, map.NWTileTypes.throwThrough, map.NWTileTypes.jumpStone, map.NWTileTypes.jumpThrough])){
        positionComponent.y = vector[1]
      } else {
        vector[1] = positionComponent.y
      }

      let blockingTile = apiUtils.ifSomeEqualMultTiles(
        collided.filter((collidable: map.CollidableQuad) => {
        return (collidable.x + collidable.width <= positionComponent.x + collisionBoxComponent.originX ||
                collidable.x >= positionComponent.x + collisionBoxComponent.originX + collisionBoxComponent.width ||
                collidable.y + collidable.height <= positionComponent.y + collisionBoxComponent.originY ||
                collidable.y >= positionComponent.y + collisionBoxComponent.originY + collisionBoxComponent.height)
                }),
        [map.NWTileTypes.jumpStone, map.NWTileTypes.blocking, map.NWTileTypes.throwThrough, map.NWTileTypes.jumpThrough])

      if(blockingTile != map.NWTileTypes.nonBlocking){
        entity.add(new flag.onWallComponent(blockingTile))
      }

    }
    return collided
  }


  /**
   * Returns a tileId if one in `all` contains one in `targetTileIds` -> ordered priority 
   * Otherwise, returns `map.NWTileTypes.nonBlocking`
   * 
   * @param all number: the tiles to check against
   * @param targetTileIds Array<map.NWTileTypes>: the tile ids to check against, in priority order (first in `targetTileIds` will return if one in `all` equals to included `targetTileIds`)
   */
  public static ifSomeEqualMultTiles = (all: Array<map.CollidableQuad>, targetTileIds: Array<map.NWTileTypes>) => {
    let types = new Array<map.NWTileTypes>()

    for(let i in all){
      types.push(all[i].collisionType)
    }

    for(let i in targetTileIds){
      if (types.includes(targetTileIds[i])) {
        return targetTileIds[i]
      }
    }

    return map.NWTileTypes.nonBlocking
  }

  /**
   * Returns true if none is `all` is comprised in `targetTileIds`
   * 
   * @param all number: the tiles to check against
   * @param targetTileIds Array<map.NWTileTypes>: the tile ids to check against
   */
  public static ifNoneEqualMultTiles = (all: Array<map.CollidableQuad>, targetTileIds: Array<map.NWTileTypes>) => {
    for (let i in all){
      if(targetTileIds.includes(all[i].collisionType)){
        return false
      }
    }
    return true
  }

  /**
   * Checks collision against any two entities
   * 
   * @param entityOne ecs.Entity
   * @param entityTwo ecs.Entity
   */
  public static collisionForNpcs = (entityOne: ecs.Entity, entityTwo: ecs.Entity) => {
    entityOne.remove(event.TouchedBy)
    entityOne.remove(event.TouchedByPlayer)
    entityTwo.remove(event.TouchedBy)
    entityTwo.remove(event.TouchedByPlayer)

    const positionComponent = entityOne.get(gameobject.PositionComponent)
    const collisionBoxComponent = entityOne.get(gameobject.CollisionBoxComponent)

    const playerCollisionBoxComponent = entityTwo.get(gameobject.CollisionBoxComponent)
    const playerPositionComponent = entityTwo.get(gameobject.PositionComponent)

    if(collisionBoxComponent.width + playerCollisionBoxComponent.width >= 
      (positionComponent.x + collisionBoxComponent.originX + collisionBoxComponent.width > playerPositionComponent.x + playerCollisionBoxComponent.originX + playerCollisionBoxComponent.width? 
        positionComponent.x + collisionBoxComponent.originX + collisionBoxComponent.width - (playerPositionComponent.x + playerCollisionBoxComponent.originX): 
        playerPositionComponent.x + playerCollisionBoxComponent.originX + playerCollisionBoxComponent.width - (positionComponent.x + collisionBoxComponent.originX)) &&

        collisionBoxComponent.height + playerCollisionBoxComponent.height >= 
        (positionComponent.y + collisionBoxComponent.originY + collisionBoxComponent.height > playerPositionComponent.y + playerCollisionBoxComponent.originY + playerCollisionBoxComponent.height? 
        positionComponent.y + collisionBoxComponent.originY + collisionBoxComponent.height - (playerPositionComponent.y + playerCollisionBoxComponent.originY) : 
        playerPositionComponent.y + playerCollisionBoxComponent.originY + playerCollisionBoxComponent.height - (positionComponent.y + collisionBoxComponent.originY))){

          if(entityOne.has(archetype.PlayerComponent)){
            entityOne.add(new event.TouchedBy(entityTwo.getId()))
            entityTwo.add(new event.TouchedByPlayer(entityOne.getId()))
          } else if (entityTwo.has(archetype.PlayerComponent)){
            entityTwo.add(new event.TouchedBy(entityOne.getId()))
            entityOne.add(new event.TouchedByPlayer(entityTwo.getId()))              
          } else {
            entityOne.add(new event.TouchedBy(entityTwo.getId()))
            entityTwo.add(new event.TouchedBy(entityOne.getId()))
          }
          console.log("Player and entity collide")
      //Player and entity collide
    }
  }

  public static byteToRad = (byte:number) => {
    return Math.round(byte*2.617)/100
    //5.233/2
  }

  public static radToByte = (rad:number) => {
    return Math.round(rad * 38.216) % 240
  }

  public static byteTo4Dir = (direction: gameobject.CharacterDirection) => {

    // Divide by the closest to top available direction, counter clockwise
    return Math.floor(direction / gameobject.CharacterDirection.Left)
  }

  public static byteTo8Dir = (direction: gameobject.CharacterDirection) => {

    // Divide by the closest to top available direction, counter clockwise
    return Math.floor(direction / gameobject.CharacterDirection.UpLeft)
  }


}