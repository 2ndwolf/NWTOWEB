import Render from "./render"
import Assets from "./assets"
import * as NeW from "./utils/cells/NwParser"
import {cellTile} from "./utils/cells/type"

import Globals from "./globals"

const init = async () => {
  
  let assetsToLoad: {[id:string]: string} = {};
  assetsToLoad['tileset'] = Globals.getOrigin()+'/assets/pics2.png'
  assetsToLoad['cellFile'] = Globals.getOrigin()+'/assets/nwfiles/contestfoyer.nw'

  await Assets.loadAssets(assetsToLoad)
  const cell : Array<cellTile> = NeW.default.parseCell(Assets.getText('cellFile'))

  Render.main()
  Render.renderALevel(cell, 16, 64)
    
}
  
  init()
