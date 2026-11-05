const FILES = 'abcdefgh'
export const initialBoard = () => {
  const b = Array.from({ length: 8 }, () => Array(8).fill(null))
  const back = ['r','n','b','q','k','b','n','r']
  for (let c=0;c<8;c++){ b[0][c]={type:back[c],color:'b'}; b[1][c]={type:'p',color:'b'}; b[6][c]={type:'p',color:'w'}; b[7][c]={type:back[c],color:'w'} }
  return b
}
export const squareName = ([r,c]) => FILES[c] + (8-r)
export const parseSquare = s => [8-Number(s[1]), FILES.indexOf(s[0])]
const inside=(r,c)=>r>=0&&r<8&&c>=0&&c<8
const copyBoard=b=>b.map(row=>row.map(p=>p?{...p}:null))
export function isAttacked(board,r,c,by){
  const pawnDir=by==='w'?-1:1, pawnRow=r-pawnDir
  for(const dc of [-1,1]) if(inside(pawnRow,c+dc)&&board[pawnRow][c+dc]?.type==='p'&&board[pawnRow][c+dc]?.color===by)return true
  for(const [dr,dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) if(inside(r+dr,c+dc)&&board[r+dr][c+dc]?.type==='n'&&board[r+dr][c+dc]?.color===by)return true
  for(const [dr,dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]){
    let rr=r+dr,cc=c+dc,step=1
    while(inside(rr,cc)){const p=board[rr][cc];if(p){if(p.color===by&&(p.type==='q'||(p.type==='k'&&step===1)||(['b','r'].includes(p.type)&&(dr===0||dc===0?p.type==='r':p.type==='b'))))return true;break}rr+=dr;cc+=dc;step++}
  }
  return false
}
export function kingInCheck(board,color){
  for(let r=0;r<8;r++)for(let c=0;c<8;c++)if(board[r][c]?.type==='k'&&board[r][c]?.color===color)return isAttacked(board,r,c,color==='w'?'b':'w')
  return true
}
function pseudo(board,from,rights,ep){
 const [r,c]=from,p=board[r][c];if(!p)return[];const out=[],add=(rr,cc,extra={})=>{if(inside(rr,cc)&&(!board[rr][cc]||board[rr][cc].color!==p.color))out.push({from,to:[rr,cc],...extra})}
 if(p.type==='p'){
  const d=p.color==='w'?-1:1,start=p.color==='w'?6:1
  if(inside(r+d,c)&&!board[r+d][c]){add(r+d,c);if(r===start&&!board[r+2*d][c])add(r+2*d,c,{double:true})}
  for(const dc of [-1,1]){const rr=r+d,cc=c+dc;if(inside(rr,cc)&&board[rr][cc]?.color!==p.color&&board[rr][cc])add(rr,cc);else if(ep&&ep[0]===rr&&ep[1]===cc)add(rr,cc,{enPassant:true})}
 }else if(p.type==='n'){for(const [dr,dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]])add(r+dr,c+dc)}
 else if(p.type==='k'){
  for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++)if(dr||dc)add(r+dr,c+dc)
  const home=p.color==='w'?7:0,enemy=p.color==='w'?'b':'w'
  if(r===home&&c===4&&!isAttacked(board,home,4,enemy)){
   if(rights[p.color+'K']&&!board[home][5]&&!board[home][6]&&board[home][7]?.type==='r'&&!isAttacked(board,home,5,enemy)&&!isAttacked(board,home,6,enemy))out.push({from,to:[home,6],castle:'K'})
   if(rights[p.color+'Q']&&!board[home][1]&&!board[home][2]&&!board[home][3]&&board[home][0]?.type==='r'&&!isAttacked(board,home,3,enemy)&&!isAttacked(board,home,2,enemy))out.push({from,to:[home,2],castle:'Q'})
  }
 }else{
  const dirs=p.type==='b'?[[-1,-1],[-1,1],[1,-1],[1,1]]:p.type==='r'?[[-1,0],[1,0],[0,-1],[0,1]]:[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]
  for(const [dr,dc] of dirs){let rr=r+dr,cc=c+dc;while(inside(rr,cc)){if(!board[rr][cc])out.push({from,to:[rr,cc]});else{if(board[rr][cc].color!==p.color)out.push({from,to:[rr,cc]});break}rr+=dr;cc+=dc}}
 }
 return out
}
export function legalMoves(board,from,rights,ep){const p=board[from[0]][from[1]];if(!p)return[];return pseudo(board,from,rights,ep).filter(m=>{const b=copyBoard(board);const piece=b[m.from[0]][m.from[1]];b[m.from[0]][m.from[1]]=null;b[m.to[0]][m.to[1]]=piece;if(m.enPassant)b[m.from[0]][m.to[1]]=null;if(m.castle){const row=m.from[0],rookCol=m.castle==='K'?7:0,newCol=m.castle==='K'?5:3;b[row][newCol]=b[row][rookCol];b[row][rookCol]=null}return !kingInCheck(b,p.color)})}
export function allLegalMoves(board,color,rights,ep){const moves=[];for(let r=0;r<8;r++)for(let c=0;c<8;c++)if(board[r][c]?.color===color)moves.push(...legalMoves(board,[r,c],rights,ep));return moves}
export function applyMove(state,move,promotion='q'){
 const board=copyBoard(state.board),[r,c]=move.from,[rr,cc]=move.to,piece=board[r][c],captured=board[rr][cc]
 board[r][c]=null;if(move.enPassant)board[r][cc]=null;board[rr][cc]={...piece,...(piece.type==='p'&&rr===(piece.color==='w'?0:7)?{type:promotion}:{})}
 const rights={...state.rights};if(piece.type==='k'){rights[piece.color+'K']=false;rights[piece.color+'Q']=false}if(piece.type==='r'){if(r===7&&c===0)rights.wQ=false;if(r===7&&c===7)rights.wK=false;if(r===0&&c===0)rights.bQ=false;if(r===0&&c===7)rights.bK=false}if(captured?.type==='r'){if(rr===7&&cc===0)rights.wQ=false;if(rr===7&&cc===7)rights.wK=false;if(rr===0&&cc===0)rights.bQ=false;if(rr===0&&cc===7)rights.bK=false}
 if(move.castle){const rookFrom=move.castle==='K'?7:0,rookTo=move.castle==='K'?5:3;board[r][rookTo]=board[r][rookFrom];board[r][rookFrom]=null}
 const ep=piece.type==='p'&&Math.abs(rr-r)===2?[(rr+r)/2,c]:null
 const next={...state,board,rights,ep,turn:state.turn==='w'?'b':'w',fullmove:state.fullmove+(state.turn==='b'?1:0),halfmove:piece.type==='p'||captured?0:state.halfmove+1,lastMove:move}
 return next
}
export const newGame=()=>({board:initialBoard(),turn:'w',rights:{wK:true,wQ:true,bK:true,bQ:true},ep:null,fullmove:1,halfmove:0,lastMove:null})
export function gameStatus(s){const check=kingInCheck(s.board,s.turn),moves=allLegalMoves(s.board,s.turn,s.rights,s.ep);if(!moves.length)return check?{over:true,text:`Checkmate · ${s.turn==='w'?'Black':'White'} wins`,check:true}:{over:true,text:'Draw · Stalemate',check:false};if(s.halfmove>=100)return{over:true,text:'Draw · 50-move rule',check:false};return{over:false,text:check?'Check!':`${s.turn==='w'?'White':'Black'} to move`,check}}
export function toFen(s){const rows=s.board.map(row=>{let line='',empty=0;for(const p of row){if(!p)empty++;else{if(empty)line+=empty;empty=0;line+=(p.color==='w'?p.type.toUpperCase():p.type)}}if(empty)line+=empty;return line}).join('/');const castling=['K','Q','k','q'].filter(x=>s.rights[x==='K'?'wK':x==='Q'?'wQ':x==='k'?'bK':'bQ']).join('')||'-';return `${rows} ${s.turn} ${castling} ${s.ep?squareName(s.ep):'-'} ${s.halfmove} ${s.fullmove}`}
