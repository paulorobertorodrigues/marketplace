import { Request, Response } from "express";
import { prisma } from "../database/prisma";
import { hash } from "bcryptjs";


export const createUser = async (req: Request, res: Response) => {
    const { name, email, password, accessName } = req.body;

    const isUserUniqueEmail = await prisma.user.findUnique({
        where: {
            email
        }
    });

    const isAccessName = await prisma.access.findUnique({
        where: {
            name: accessName
        }
    })
    if(!isAccessName) {
        return res.status(400).json({ message: "Este nivél de acesso não existe!" });
    }

    if (isUserUniqueEmail) {
        return res.status(400).json({ message: "Já existe um usuário com este email!" })
    }

    const hashPassword = await hash(password, 8);

    const user = await prisma.user.create({
        data: {
            name, email, password: hashPassword, Access: {
                connect: {
                    name: accessName
            }
        }},
        select: {
            id: true,
            name: true,
            email:true,
            Access:{
                select:{
                    name:true,
                }
            }
        }
    });
    return res.json(user);

};

export const deleteManyUser = async (req: Request, res: Response) => {

    await prisma.user.deleteMany();
    return res.json({ message: "Usuarios deletados" });
}