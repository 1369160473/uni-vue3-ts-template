import http from '../http'
/**
 * 获取笔记页的绘画坐标点
 * @param fileId 笔记页的id,在该处，由于后续转写不仅仅是笔记页，还有其他的，因此写为fileId
*/
function getOriginalDataJsonDownload(notePageId:string): Promise<{ num: number }> {
  return http.get(`/system-picture/notePage/getOriginalDataJsonDownload?notePageId=${notePageId}`)
}
/**
 * 下载
 * @param fileId 笔记页的id,在该处，由于后续转写不仅仅是笔记页，还有其他的，因此写为fileId
*/
function getNotePageSvgPicture(notePageUuid:string,type:string): Promise<{ num: number }> {
  return http.get(`/system-picture/OriginalDrawData/getNotePageSvgPicture?notePageUuid=${notePageUuid}&type=${type}`)
}
function findNotePage(id:string): Promise<{ num: number }> {
  return http.get(`/system-picture/notePage/findNotePage/${id}`)
}
function text(url:string): Promise<{ num: number }> {
  return http.get(url)
}
/**
 * 这个是获取某一个背景的信息
 * @param notePageBackGroundId
*/
function getNotePageBackgroundToId(notePageBackGroundId:string): Promise<{ num: number }> {
  return http.get(`/system-picture/notePageBackground/getNotePageBackgroundToId?notePageBackGroundId=${notePageBackGroundId}`)
}
function DOWNSVG(url:string): Promise<{ num: number }> {
  return http.get(url,{
	  responseType: 'blob'
  })
}
function getdown(): Promise<{ num: number }> {
  return http.get('/notePageSVG/94187_434879509099973758.svg')
}
export default {
  getOriginalDataJsonDownload,
  getNotePageSvgPicture,
  text,
  findNotePage,
  DOWNSVG,
  getdown,
  getNotePageBackgroundToId
}
