
export default class Globals {
  private static gameWidth : number = 1024;
  private static gameHeight : number = 1024;

  private static origin : string = 'http://localhost:8003'

  private static imgExts: Array<string> = ['png','jpg','gif']
  private static txtExts: Array<string> = ['nw','txt', 'vert', 'frag']

  public static getGameWidth() : number {
    return Globals.gameWidth
  }
  public static getGameHeight() : number {
    return Globals.gameHeight
  }

  public static getOrigin() : string {
    return Globals.origin
  }

  public static getTxtExts() : Array<string> {
    return Globals.txtExts;
  }

  public static getImgExts() : Array<string> {
    return Globals.imgExts;
  }

}
