export interface responseFace {
  data: string;
  success: String;
  status: Number;
  errorMsg: string;
}

export interface transformedData {
  status: Boolean;
  success: String;
  message: String;
  data: string;
  tenantConfig: Object;
}

export interface getCodeReq {
  artboardImg?: String;
}

export interface getImgSourceReq {
  url: String;
}
