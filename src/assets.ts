import Globals from "./globals"

export default class Assets {
  private static images: { [id: string] : HTMLImageElement} = {}
  private static texts: { [id: string] : string} = {}

  public static getImage(id:string) : HTMLImageElement {
    return Assets.images[id]
  }
  public static getText(id:string) : string {
    return Assets.texts[id]
  }

  public static isTxtExt(ext:string){
    return Globals.getTxtExts().indexOf(ext) > - 1
  }

  public static isImgExt(ext:string){
    return Globals.getImgExts().indexOf(ext) > - 1
  }


  public static async loadAssets(assetList: {[id: string]: string}) : Promise<void[]>{
    let assetPromises: Array<Promise<void>> = []
    
    for(let ast in assetList){
      assetPromises.push(new Promise (resolve=>{
        resolve(Assets.loadAsset(ast,assetList[ast]))
      }))
    }
    return await Promise.all(assetPromises)
  }
  
  private static async loadAsset(id : string, file : string) : Promise<void> {
    let splt : Array<string> = file.split('/')
    let fileName : Array<string> = splt[splt.length-1].split('.')
    
    if(Assets.isImgExt(fileName[fileName.length-1])) {
      await Assets.loadImage(id,file)
    } else if (Assets.isTxtExt(fileName[fileName.length-1])) {
      await Assets.loadText(id,file)
    }

  }

  private static async loadImage(id:string,file:string): Promise<void>{
    let response : Response = await fetch(file)
    let myBlob : Blob = await response.blob()
    let ab : any = await this.blobToBase64(myBlob)

    await new Promise<void>(resolve=> {
      let image : HTMLImageElement = document.createElement('img');
      image.src = ab;

      image.addEventListener("load", ()=>{        
        Assets.images[id] = image
        resolve()})
    })
  }

  private static async loadText(id:string,file:string): Promise<void>{
    const response : Response = await fetch(file)
    const data : string = await response.text();
    Assets.texts[id] = data;
  }

  private static async blobToBase64(blob) {
    return new Promise((resolve, _) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }
}