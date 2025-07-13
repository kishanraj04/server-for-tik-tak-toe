export const getRoomMessage = (socket1,socket2)=>{
     const board = [
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
    ];
const roomMessage = {
      board:board,
      player1:{
        ...socket1,
        symbol:"X"
      },
      player2:{
        ...socket2,
        symbol:"O"
      },
      currentTurn:"player1",
      winner:""
    }

    return roomMessage;
}