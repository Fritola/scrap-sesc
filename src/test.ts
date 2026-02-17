import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function run() {
  const menuData = {
    unidade: "Sesc 24 de Maio",
    dias: {
      terca: {
        salada:
          "Folha verde | couve-flor com salsa | macarrão com milho, gergelim e cebolinha",
        carne: "Fricassê de frango com batata palha",
        vegetariana:
          "Quibe de trigo com mostarda, cenoura e molho de limão e hortelã",
        guarnicao: "Cenoura salteada com ervas",
        base: "Arroz (integral ou branco) e feijão",
      },
      quarta: {
        salada:
          "Folha verde | couve-flor com salsa | macarrão com milho, gergelim e cebolinha",
        carne: "Fricassê de frango com batata palha",
        vegetariana:
          "Quibe de trigo com mostarda, cenoura e molho de limão e hortelã",
        guarnicao: "Cenoura salteada com ervas",
        base: "Arroz (integral ou branco) e feijão",
      },
      quinta: {
        salada:
          "Folha verde | couve-flor com salsa | macarrão com milho, gergelim e cebolinha",
        carne: "Fricassê de frango com batata palha",
        vegetariana:
          "Quibe de trigo com mostarda, cenoura e molho de limão e hortelã",
        guarnicao: "Cenoura salteada com ervas",
        base: "Arroz (integral ou branco) e feijão",
      },
      sexta: {
        salada:
          "Folha verde | couve-flor com salsa | macarrão com milho, gergelim e cebolinha",
        carne: "Fricassê de frango com batata palha",
        vegetariana:
          "Quibe de trigo com mostarda, cenoura e molho de limão e hortelã",
        guarnicao: "Cenoura salteada com ervas",
        base: "Arroz (integral ou branco) e feijão",
      },
      sabado: {
        salada:
          "Folha verde | couve-flor com salsa | macarrão com milho, gergelim e cebolinha",
        carne: "Fricassê de frango com batata palha",
        vegetariana:
          "Quibe de trigo com mostarda, cenoura e molho de limão e hortelã",
        guarnicao: "Cenoura salteada com ervas",
        base: "Arroz (integral ou branco) e feijão",
      },
      domingo: {
        salada:
          "Folha verde | couve-flor com salsa | macarrão com milho, gergelim e cebolinha",
        carne: "Fricassê de frango com batata palha",
        vegetariana:
          "Quibe de trigo com mostarda, cenoura e molho de limão e hortelã",
        guarnicao: "Cenoura salteada com ervas",
        base: "Arroz (integral ou branco) e feijão",
      },
    },
  };

  // remove cardápio antigo
  await prisma.weeklyMenu.deleteMany();

  // insere novo
  await prisma.weeklyMenu.create({
    data: {
      unit: "Sesc 24 de Maio",
      data: menuData,
    },
  });

  console.log("Cardápio atualizado.");
}

run()
  .catch((err) => {
    console.error(err);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
