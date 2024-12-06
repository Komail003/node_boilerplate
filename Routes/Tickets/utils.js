import crypto from "crypto";

const generateUniqueTicketIds = (quantity) => {
  const ticketIds = [];
  for (let i = 0; i < quantity; i++) {
    const uniqueId = `T-${crypto.randomBytes(6).toString("hex")}`;
    ticketIds.push(uniqueId);
  }
  return ticketIds;
};

export  default generateUniqueTicketIds;