import * as ecs from 'ecs'


import GaniParser from 'shared/utils/animation/GaniParser'
import * as animation from 'shared/ecs/components/animation'

//#!if CLIENT_SIDE
import loader from 'client/utils/loader'
import * as render from 'shared/ecs/components/render'
//#!elseif SERVER_SIDE

//!#endif
//#!if CLIENT_SIDE

// No need for this to have any server-side logic as of now
// will take only the current frame and current gani from the player
// and play gani accordingly
// may need a client side entity that keeps all loaded animations
// in memory instead of loading them individually for each player

export default class GaniUtils {

  public static getTextures = async (parsedGani, textureComponent) => {

    // parsedGani.defaults.forEach(async e => {
    //   const img = await loader.loadImage('assets/images/' + e) as any
    //   zMap.set(e,img)
    // });
    
    for(let i = 0; i < parsedGani.sprites.length; i++){
      if(textureComponent.textureNames.indexOf(parsedGani.sprites[i]) == -1){
        if(parsedGani.sprites[i] == "SPRITES"){
          var img = await loader.loadImage('assets/images/sprites.png') as any

          //These will be defaults, should in fact be taking the images from the player properties
        } else if(parsedGani.sprites[i] == "BODY"){
          var img = await loader.loadImage('assets/images/body.png') as any
        } else if(parsedGani.sprites[i] == "HEAD"){
          var img = await loader.loadImage('assets/images/head0.png') as any
        } else if(parsedGani.sprites[i] == "SWORD"){
          var img = await loader.loadImage('assets/images/sword1.png') as any
        } else if(parsedGani.sprites[i] == "SHIELD"){
          var img = await loader.loadImage('assets/images/shield1.png') as any
        } else if(parsedGani.sprites[i] == "HORSE"){
          var img = await loader.loadImage('assets/images/ride.png') as any
          //end of defaults

        } else if(parsedGani.sprites[i].startsWith("ATTR")){
          let tmp = parsedGani.sprites[i].split("/")
          textureComponent.textureNames.push(tmp[0])
          var img = await loader.loadImage('assets/images/' + tmp[1]) as any
        } else {
          var img = await loader.loadImage('assets/images/' + parsedGani.sprites[i]) as any
        }
        if(textureComponent.textureNames.length == textureComponent.textures.length) textureComponent.textureNames.push(parsedGani.sprites[i])
        textureComponent.textures.push(img)
      }
    }
  }
  
  public static loadGani = async (file:string, entity: ecs.Entity) => {
    const ganiComponent = entity.get(animation.GaniComponent)
  
    if(ganiComponent.currentGani != file){
      const textureComponent = entity.get(render.TexturesComponent)
      
      if(ganiComponent.ganiNames.length != 0) {
        if(!ganiComponent.ganiNames.includes(file)){
          await GaniUtils.ganiLoader(file,ganiComponent,textureComponent)
        }
      } else {
        await GaniUtils.ganiLoader(file,ganiComponent,textureComponent)
      }
      ganiComponent.currentFrame = 0
      ganiComponent.currentGani = file 
    }
  }
  
  static ganiLoader = async (file:string, ganiComponent, textureComponent) => {
    const gani = (await loader.loadBlob("assets/ganis/" + file)).toString()
    const parsedGani = GaniParser.parse(gani)
    ganiComponent.ganis.push(parsedGani)
    ganiComponent.ganiNames.push(file)
    await GaniUtils.getTextures(parsedGani, textureComponent)
  }

}
//!#endif
