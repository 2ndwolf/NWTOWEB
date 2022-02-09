import Render from "./render"
import Assets from "./assets"
import * as NeW from "./utils/cells/NwParser"
import cellTile from "./utils/cells/type"

import {promises as fs} from 'node:fs'
import * as path from 'path'

var gameWidth = 800;
var gameHeight = 600;

const init = async () => {
  
  let assetsToLoad: {[id:string]: string} = {};
  assetsToLoad['tileset'] = 'http://localhost:8003/assets/pics2.png'
  assetsToLoad['cellFile'] = 'http://localhost:8003/nwfiles/zo_ay25.nw'
  let assets = new Assets();

  await Assets.loadAssets(assetsToLoad)
  // console.log(Assets.getText('tileset'))
  // .then(()=>{
  const cell : Array<cellTile> = NeW.default.parseCell(Assets.getText('cellFile'))
  console.log(cell)
  console.log(Assets.getImage('tileset'))

  Render.main()

  Render.renderASquare(cell)
    
  //     }
  //   )
    
    
    // const cellData : string = await fs.readFile(, 'utf8')
  }
  
  init()
  // Render.main();