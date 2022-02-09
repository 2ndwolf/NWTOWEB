
/**
 * Parses ganis, main function is parse
 * 
 * 
 */
export default class GaniParser {

  /**
   * Main function, calls multiple functions to parse a raw gani file.
   * 
   * @param {string} ganiText A raw gani file that has been converted to a string.
   * 
   * @returns {Gani} An object containing parsed gani information.
   */
  public static parse = (ganiText: string) => {
    // Split gani text by newline.
    const ganiTextSplit = ganiText.split('\n');
    
    // Parse sprites, defaults and frames.
    const parsedSprites = GaniParser.parseSprites(ganiTextSplit);
    //TODO ignore ATTR1 etc, should be handled by parsedDefaults
    const parsedProperties = GaniParser.parseProperties(ganiTextSplit)
    const parsedDefaults = GaniParser.parseDefaults(ganiTextSplit);
    const parsedFrames = GaniParser.parseFrames(ganiTextSplit, parsedSprites)
    //TODO Pass parsed defaults instead of parsedProperties
    const filteredSprites = GaniParser.filterSprites(parsedSprites, parsedProperties)

    //filter out images found in properties
    //TODO: remove this code once parsedProperties ignore ATTR1 etc..
    for(let i = 0; i < parsedProperties.length; i++){
      if(parsedProperties[i].indexOf("/") > -1) parsedProperties.splice(i,1)
    }
    return new Gani(parsedDefaults, filteredSprites, parsedProperties, parsedFrames)
  }

  /**
   * Extract the sprite information.
   * 
   * (reference number),(img name),(xpos in spritesheet),(ypos in spritesheet),(xpos in gani),(ypos in gani)
   * 
   * @param {Array<string>} ganiTextSplit Array of lines in the gani file.
   * @returns {Map<string, GaniSprite>} An array of GaniSprites.
   */
  public static parseSprites = (ganiTextSplit: Array<string>) => {
    // Sprites
    // const reg = new RegExp('~/^SPRITE\s+(\d+)\s+(\S+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+?(\S?.*?)$/m','');
    const reg = new RegExp(/^SPRITE\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)/)
    const sprites = new Map<string, GaniSprite>()

    for(let i = 0; i < ganiTextSplit.length; i++) {
      const matched = reg.exec(ganiTextSplit[i])
      if(matched != null && matched.length > 0) {
        const ganiSprite = new GaniSprite(matched[2],Number(matched[3]),Number(matched[4]),Number(matched[5]),Number(matched[6]))
        sprites.set(matched[1],ganiSprite)
      }
    }

    return sprites
  }

  /**
   * Extract the gani's properties
   * 
   * Possible properties are: loop, continuous(?) and singledirection (list complete?)
   * 
   * @param {Array<string>} ganiTextSplit Array of lines in the gani file
   * @return {Array<string>} A string array of gani properties
   */
  public static parseProperties = (ganiTextSplit: Array<string>) => {
    let startIndex = 0
    let setBackTo: string = ""
    let props = 0
    let rProps = []
    let attribNumber = 1


    for(let i = 0; i < ganiTextSplit.length; i++){
      if(ganiTextSplit[i].length == 1 && startIndex == 0){
        startIndex = i+1
      } else if(startIndex != 0) {

        if(ganiTextSplit[i].startsWith("SETBACKTO")){
          props |= GaniProperties.SETBACKTO
          let tmp = ganiTextSplit[i].split(" ")
          for(let j = 1; j < tmp.length; j++){
            setBackTo += tmp[j]
          }
          setBackTo = setBackTo.trim().concat(".gani")

        } else if(ganiTextSplit[i].startsWith("SINGLEDIRECTION")){
          props = props | GaniProperties.SINGLEDIRECTION

        } else if(ganiTextSplit[i].startsWith("LOOP")){
          props = props | GaniProperties.LOOP

        } else if(ganiTextSplit[i].startsWith("CONTINUOUS")){
          props = props | GaniProperties.CONTINUOUS

        } else if(ganiTextSplit[i].startsWith("DEFAULTATTR" + attribNumber)){
          let tmp = ganiTextSplit[i].split(" ")
          let filename = ""
          for(let j = 1; j < tmp.length; j++){
            filename += tmp[j]
          }
          rProps.push("ATTR" + attribNumber + "/" + filename)
          attribNumber += 1

        } else if(ganiTextSplit[i].startsWith("DEFAULTPARAM")){
          console.log("Loaded gani contains parameters, those are not supported yet")
        }
      }
    }


    rProps.push(String(props))
    rProps.push(setBackTo)
    return rProps
  }

  /**
   * Extract the gani's defaults images (Head, Body, Attr1...)
   * 
   * Probably only used for the graalShop editor...(?) Attributes can have filenames in them but
   * I think they're managed with gscript when the gani is loaded in the client
   * 
   * @param {Array<string>} ganiTextSplit Array of lines in the gani file
   * @returns {Map<string, string>} A map of the gani's default images <defaultType, defaultImageName>
   */
  public static parseDefaults = (ganiTextSplit: Array<string>) => {
    // Defaults
    const reg = new RegExp(/^DEFAULT(\S+)\s(.*)/);
    const defaults = new Map<string, string>();

    for(let i = 0; i < ganiTextSplit.length; i++) {
      const matched = reg.exec(ganiTextSplit[i])
      if(matched != null && matched.length > 0) {
        defaults.set(matched[1], matched[2]);
      }
    }
    return defaults;
  }

  /**
   * Extract the frames, see the comment in the function to see how its array is built
   * 
   * @param {Array<string>} ganiTextSplit Array of lines in the gani file
   * @param {Map<string, GaniSprite>} parsedSprites The parsed sprite information
   * 
   * @returns {Array<Array<Array<GaniTable>>>} A 3D array, see comment in function
   */
  public static parseFrames = (ganiTextSplit: Array<string>, parsedSprites: Map<string, GaniSprite>) => {
    // Animation frames
    let startIndex = 0;
    let endIndex = 0;

    for (let i = 0; i < ganiTextSplit.length; i++) {   
      if (ganiTextSplit[i].startsWith("ANIEND")) {
        endIndex = i;
      } else if(ganiTextSplit[i].startsWith("ANI")) {
        startIndex = i + 1;
      }
    }

    const ganiTextFrames = ganiTextSplit.slice(startIndex, endIndex);

    //3 dimensional array like so
    /*[
      [frame 0
      [layer0,layer1...], //dir0 - every sprite has its layer every "layer"/sprite is a GaniTable
      [dir1,dir1...],
      [dir2,dir2...],
      [dir3,dir3...]
      ],
      [frame 1
      [dir0,dir0...],
      [dir1,dir1...],
      [dir2,dir2...],
      [dir3,dir3...]
      ]
      ]
    */
    const frames = new Array<Array<Array<GaniTable>>>();

    let reg = new RegExp(/^\s*(\d+)\s*(-*\d+)\s*(-*\d+)/)
    let soundFileName = new RegExp(/^PLAYSOUND\s(.+\.wav)/)
    let dir = 0
    let currentFrame = 0
    let sounds = []
    let waitTime = 0



    for(let i = 0; i < ganiTextFrames.length; i++){
      let lookupIndex = 0
      //lookup frame properties only on first dir and keep to add to every dir
      if(dir == 0){
        while(ganiTextFrames[i+lookupIndex].length != 1){
          if(ganiTextFrames[i+lookupIndex].startsWith("WAIT")){
            let waitText = ganiTextFrames[i+lookupIndex].split(' ')
            waitTime += Number(waitText[1])
          }
          if (ganiTextFrames[i+lookupIndex].startsWith("PLAYSOUND")){
            sounds.push(soundFileName.exec(ganiTextFrames[i+lookupIndex])[1])
          }
          lookupIndex += 1
          if(ganiTextFrames[i+lookupIndex] == undefined){
            break
          }
        }
      }

      let dirElements = ganiTextFrames[i].split(',')
      if(reg.exec(dirElements[0]) != null){
        for(let j = 0; j < dirElements.length; j++){
          let spriteProps = reg.exec(dirElements[j])
          if(frames[currentFrame] == undefined){
            frames[currentFrame] = []
          }
          if(frames[currentFrame][dir] == undefined){
            frames[currentFrame][dir] = []
          }
          frames[currentFrame][dir].push(new GaniTable(
            parsedSprites.get(String(spriteProps[1])),
            Number(spriteProps[2]),
            Number(spriteProps[3]),
            waitTime,
            sounds))
        }
      }
      if(ganiTextFrames[i].length != 1) dir += 1
      else {
        sounds = []
        waitTime = 0
        currentFrame += 1
        dir = 0
      }

    }
    
    return frames;
  } 

  /**
   * Extract the ganis non default image names
   * 
   * @param parsedSprites A Map<string,GaniSprite> of the sprites
   * @param parsedDefaults The defaults Map<defaultType,defaultImageName>, attributes may hold filenames, unused for now
   * 
   * @returns {Array<string>} An array of non default image names used in the gani
   */
  public static filterSprites = (parsedSprites, parsedProperties: Array<string>) =>{
    let zarray = []

    //parsedDefaults contains values for images that change depending on the player attributes (e.g: HEAD)
    //but could also contain other values for images that are specific to the
    //gani (e.g:ATTR2)... however I think they have to be specified in gscript(?)
    //not sure what to do with this

    parsedSprites.forEach((value: GaniSprite, key: string) => {
      if( /* value.img!="SPRITES" && 
        value.img!="BODY" && 
        value.img!="HEAD" && 
        value.img!="SWORD" && 
        value.img!="SHIELD" && 
        value.img!="HORSE" &&  */ 
        value.img!="ATTR1" && 
        value.img!="ATTR2" && 
        value.img!="ATTR3"  && 
        value.img!="PARAM1" && 
        value.img!="PARAM2" && 
        value.img!="PARAM3" ){
          if(zarray.indexOf(value.img) == -1) zarray.push(value.img)
      }
    })

    for(let i = 0; i < parsedProperties.length; i++){
      if(parsedProperties[i].indexOf("/") > -1) zarray.push(parsedProperties[i])
    }

    // parsedDefaults.forEach(e => {
      //will be taken care of in GaniUtil's getTextures
    // })

    return zarray
  }
}

/**
 * Holds sprite information
 */
class GaniSprite {
  img: string
  x: number
  y: number
  w: number
  h: number

  constructor(img, x, y, w, h){
    this.img = img
    this.x = x
    this.y = y
    this.w = w
    this.h = h
  }
} 

/**
 * One GaniTable for each "layer" on each frame see comment in parseFrames
 */
export class GaniTable {
  sprite: GaniSprite;
  x: number;
  y: number;
  wait: number;
  sounds: Array<string> = null

  constructor(sprite: GaniSprite = null, x: number = 0, y: number = 0, wait: number = 0, sounds: Array<string> = null){
    this.sprite = sprite
    this.x = x
    this.y = y
    this.wait = wait
    this.sounds = sounds
  }
}

/**
 * The outputted class
 */
export class Gani {
  defaults: Map<string, string>;
  sprites: Array<string>
  properties: Array<string> //loop, continuous, singledirection
  frames: Array<Array<Array<GaniTable>>>
  
  constructor(defaults, sprites, properties, frames) {
    this.defaults = defaults
    this.sprites = sprites
    this.properties = properties
    this.frames = frames
  }

}

export const enum GaniProperties {
  LOOP = 1 << 1,
  CONTINUOUS = 1 << 2,
  SETBACKTO = 1 << 3,
  SINGLEDIRECTION = 1 << 4
}