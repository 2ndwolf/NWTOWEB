import NwParser from "./NwParser"

/**
 * This is an helper class. loadCellFromPath, getCell, buildTilePosArray and buildIdsArray will be deprecated in future versions.
 * parseCell should/will have compatibility with multiple file formats
 * 
 */
export default class CellUtils {
  /**
   * Parses a cell, right now this is a wrapper function for NwParser's parse function
   * should be kept for compatibility with multiple cell formats
   * 
   * @param {string} rawCell A (nw) cell file converted to a string
   */
  public static parseCell = (rawCell: string) => NwParser.parseCell(String(rawCell))
    /* {
    let rawCell = await CellUtils.getCell(filePath)
    rawCell = rawCell.toString()
    
    let extension = filePath.split(".")
    if(extension[extension.length-1].toLowerCase() == "nw"){
      var parsedCell = NwParser.parse(String(rawCell))
      console.log(parsedCell)
    } else console.log("Only nw file format is supported for now.")

    var parsedCell = NwParser.parse(String(rawCell))
    
    return parsedCell
  }
*/

  /**
   * Builds an array from an object list, will be deprecated since objects are
   * a bit faster than Uint8Arrays when blitting the cell. See comment at end of file.
   * Parsed cells will have their frameX and frameY keys pre multiplicated by 16 so avoid calculations during blitting.
   * 
   * @param {Object} parsedCell An object with the keys "frameX" and "frameY" -> x/y pos of the tile on the tileset image
   */
  public static buildTilePosArray = (parsedCell) =>{
    let zarray = new Uint16Array(64*64*2)
    for(var i = 0; i < parsedCell.length; i++){
      zarray[i*2] = parsedCell[i].frameX
      zarray[i*2+1] = parsedCell[i].frameY
    }
    return zarray
  }

  /**
   * Builds a tile id array from an object list, will also be deprecated since
   * object lists are still faster, see comment at end of file
   * 
   * @param {Object} parsedCell An object with the key "id" -> (tiletypes)
   */
  public static buildIdsArray = (parsedCell) =>{
    let zarray = new Uint8Array(64*64)
    for(var i = 0; i < parsedCell.length; i++){
      zarray[i] = parsedCell[i].id
    }
    return zarray
  }

  public static parseBigMap = (bigMap: string) => {
    let strippedBigMap = bigMap.replace(/"/g,'')
    let cellFileNames = new Array<Array<string>>()
    let cellRows = []

    cellRows = strippedBigMap.split('\n')

    for(let i = 0; i < cellRows.length; i++)
      cellFileNames[i] = cellRows[i].split(',')

      // console.log(cellFileNames)
    return cellFileNames
  }
  
}


//Parsing included:
//Uint8Array,  maths on blitting          => 172ms                          
//Uint16Array, some maths before blitting => 179ms
//Object list, maths on blitting          => 197ms
//Object list, maths before blitting      => 168ms

//Parsing excluded:
//Uint8Array,  maths on blitting          => 37ms 
//Uint16Array, some maths before blitting => 25ms
//Object list, maths on blitting          => 33ms
//Object list, maths before blitting      => 24ms

//Parsing included
//Big Uint16Array with all maths done before blitting => 153

//Parsing excluded
//Big Uint16Array with all maths done before blitting => 30