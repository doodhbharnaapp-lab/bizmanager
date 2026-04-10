// // import { Router } from "express";
// // import { db } from "@workspace/db";
// // import { customersTable, ledgerEntriesTable } from "@workspace/db/schema";
// // import { eq, and } from "drizzle-orm";

// // const router = Router();

// // router.get("/", async (req, res) => {
// //   try {
// //     const userId = (req as any).userId;
// //     const { search } = req.query;
// //     let customers = await db.select().from(customersTable)
// //       .where(eq(customersTable.userId, userId))
// //       .orderBy(customersTable.name);
// //     if (search) {
// //       const q = (search as string).toLowerCase();
// //       customers = customers.filter(c => c.name.toLowerCase().includes(q));
// //     }
// //     res.json(customers.map(formatCustomer));
// //   } catch (err) {
// //     req.log.error(err);
// //     res.status(500).json({ error: "Internal server error" });
// //   }
// // });

// // router.get("/:id", async (req, res) => {
// //   try {
// //     const userId = (req as any).userId;
// //     const id = parseInt(req.params.id);
// //     const customers = await db.select().from(customersTable)
// //       .where(and(eq(customersTable.id, id), eq(customersTable.userId, userId)));
// //     if (!customers[0]) return res.status(404).json({ error: "Not found" });
// //     res.json(formatCustomer(customers[0]));
// //   } catch (err) {
// //     req.log.error(err);
// //     res.status(500).json({ error: "Internal server error" });
// //   }
// // });

// // router.post("/", async (req, res) => {
// //   try {
// //     const userId = (req as any).userId;
// //     const { name, phone, email, address, gstNumber } = req.body;
// //     const result = await db.insert(customersTable)
// //       .values({ userId, name, phone, email, address, gstNumber })
// //       .returning();
// //     res.status(201).json(formatCustomer(result[0]));
// //   } catch (err) {
// //     req.log.error(err);
// //     res.status(500).json({ error: "Internal server error" });
// //   }
// // });

// // router.put("/:id", async (req, res) => {
// //   try {
// //     const userId = (req as any).userId;
// //     const id = parseInt(req.params.id);
// //     const { name, phone, email, address, gstNumber } = req.body;
// //     const result = await db.update(customersTable)
// //       .set({ name, phone, email, address, gstNumber })
// //       .where(and(eq(customersTable.id, id), eq(customersTable.userId, userId)))
// //       .returning();
// //     if (!result[0]) return res.status(404).json({ error: "Not found" });
// //     res.json(formatCustomer(result[0]));
// //   } catch (err) {
// //     req.log.error(err);
// //     res.status(500).json({ error: "Internal server error" });
// //   }
// // });

// // router.delete("/:id", async (req, res) => {
// //   try {
// //     const userId = (req as any).userId;
// //     const id = parseInt(req.params.id);
// //     await db.delete(customersTable)
// //       .where(and(eq(customersTable.id, id), eq(customersTable.userId, userId)));
// //     res.json({ message: "Deleted" });
// //   } catch (err) {
// //     req.log.error(err);
// //     res.status(500).json({ error: "Internal server error" });
// //   }
// // });

// // router.get("/:id/ledger", async (req, res) => {
// //   try {
// //     const userId = (req as any).userId;
// //     const partyId = parseInt(req.params.id);
// //     const entries = await db.select().from(ledgerEntriesTable)
// //       .where(and(
// //         eq(ledgerEntriesTable.userId, userId),
// //         eq(ledgerEntriesTable.partyType, "customer"),
// //         eq(ledgerEntriesTable.partyId, partyId)
// //       ))
// //       .orderBy(ledgerEntriesTable.date, ledgerEntriesTable.createdAt);
// //     const formatted = entries.map(formatLedgerEntry);
// //     const totalDebit = formatted.reduce((s, e) => s + e.debit, 0);
// //     const totalCredit = formatted.reduce((s, e) => s + e.credit, 0);
// //     const closingBalance = formatted.length > 0 ? formatted[formatted.length - 1].balance : 0;
// //     res.json({ entries: formatted, openingBalance: 0, closingBalance, totalDebit, totalCredit });
// //   } catch (err) {
// //     req.log.error(err);
// //     res.status(500).json({ error: "Internal server error" });
// //   }
// // });

// // function formatCustomer(c: any) {
// //   return { ...c, balance: parseFloat(c.balance || "0"), createdAt: c.createdAt?.toISOString?.() || c.createdAt };
// // }

// // function formatLedgerEntry(e: any) {
// //   return {
// //     ...e,
// //     debit: parseFloat(e.debit || "0"),
// //     credit: parseFloat(e.credit || "0"),
// //     balance: parseFloat(e.balance || "0"),
// //     createdAt: e.createdAt?.toISOString?.() || e.createdAt,
// //   };
// // }

// // export default router;
// import { Router } from "express";
// import { db } from "@workspace/db";
// import { customersTable, ledgerEntriesTable } from "@workspace/db/schema";
// import { eq, and, gte, lte } from "drizzle-orm";

// const router = Router();

// router.get("/", async (req, res) => {
//   try {
//     const userId = (req as any).userId;
//     const { search } = req.query;
//     let customers = await db.select().from(customersTable)
//       .where(eq(customersTable.userId, userId))
//       .orderBy(customersTable.name);
//     if (search) {
//       const q = (search as string).toLowerCase();
//       customers = customers.filter(c => c.name.toLowerCase().includes(q));
//     }
//     res.json(customers.map(formatCustomer));
//   } catch (err) {
//     req.log.error(err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// router.get("/:id", async (req, res) => {
//   try {
//     const userId = (req as any).userId;
//     const id = parseInt(req.params.id);
//     const customers = await db.select().from(customersTable)
//       .where(and(eq(customersTable.id, id), eq(customersTable.userId, userId)));
//     if (!customers[0]) return res.status(404).json({ error: "Not found" });
//     res.json(formatCustomer(customers[0]));
//   } catch (err) {
//     req.log.error(err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// router.post("/", async (req, res) => {
//   try {
//     const userId = (req as any).userId;
//     const { name, phone, email, address, gstNumber } = req.body;

//     // Validation
//     if (!name || name.trim() === "") {
//       return res.status(400).json({ error: "Customer name is required" });
//     }

//     const result = await db.insert(customersTable)
//       .values({
//         userId,
//         name: name.trim(),
//         phone: phone || null,
//         email: email || null,
//         address: address || null,
//         gstNumber: gstNumber || null
//       })
//       .returning();
//     res.status(201).json(formatCustomer(result[0]));
//   } catch (err) {
//     req.log.error(err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// router.put("/:id", async (req, res) => {
//   try {
//     const userId = (req as any).userId;
//     const id = parseInt(req.params.id);
//     const { name, phone, email, address, gstNumber } = req.body;

//     // Validation
//     if (!name || name.trim() === "") {
//       return res.status(400).json({ error: "Customer name is required" });
//     }

//     const result = await db.update(customersTable)
//       .set({
//         name: name.trim(),
//         phone: phone || null,
//         email: email || null,
//         address: address || null,
//         gstNumber: gstNumber || null,
//         updatedAt: new Date()
//       })
//       .where(and(eq(customersTable.id, id), eq(customersTable.userId, userId)))
//       .returning();
//     if (!result[0]) return res.status(404).json({ error: "Not found" });
//     res.json(formatCustomer(result[0]));
//   } catch (err) {
//     req.log.error(err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// router.delete("/:id", async (req, res) => {
//   try {
//     const userId = (req as any).userId;
//     const id = parseInt(req.params.id);

//     // Check if customer has ledger entries before deleting
//     const existingEntries = await db.select().from(ledgerEntriesTable)
//       .where(and(
//         eq(ledgerEntriesTable.userId, userId),
//         eq(ledgerEntriesTable.partyType, "customer"),
//         eq(ledgerEntriesTable.partyId, id)
//       ));

//     if (existingEntries.length > 0) {
//       return res.status(400).json({
//         error: "Cannot delete customer with existing transactions. Please delete or reassign transactions first."
//       });
//     }

//     await db.delete(customersTable)
//       .where(and(eq(customersTable.id, id), eq(customersTable.userId, userId)));
//     res.json({ message: "Customer deleted successfully" });
//   } catch (err) {
//     req.log.error(err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // FIXED: Ledger endpoint with proper date filtering
// router.get("/:id/ledger", async (req, res) => {
//   try {
//     const userId = (req as any).userId;
//     const partyId = parseInt(req.params.id);
//     const { fromDate, toDate } = req.query;

//     console.log("Ledger request - PartyId:", partyId, "FromDate:", fromDate, "ToDate:", toDate);

//     // Build base conditions
//     let conditions = and(
//       eq(ledgerEntriesTable.userId, userId),
//       eq(ledgerEntriesTable.partyType, "customer"),
//       eq(ledgerEntriesTable.partyId, partyId)
//     );

//     // Add date filters if provided
//     if (fromDate && fromDate !== "") {
//       const fromDateObj = new Date(fromDate as string);
//       fromDateObj.setHours(0, 0, 0, 0);
//       conditions = and(conditions, gte(ledgerEntriesTable.date, fromDateObj));
//       console.log("Applied fromDate filter:", fromDateObj);
//     }

//     if (toDate && toDate !== "") {
//       const toDateObj = new Date(toDate as string);
//       toDateObj.setHours(23, 59, 59, 999);
//       conditions = and(conditions, lte(ledgerEntriesTable.date, toDateObj));
//       console.log("Applied toDate filter:", toDateObj);
//     }

//     // Get filtered entries
//     let entries = await db.select().from(ledgerEntriesTable)
//       .where(conditions)
//       .orderBy(ledgerEntriesTable.date, ledgerEntriesTable.createdAt);

//     console.log(`Found ${entries.length} entries after filtering`);

//     const formatted = entries.map(formatLedgerEntry);

//     // Calculate totals from filtered entries
//     const totalDebit = formatted.reduce((s, e) => s + e.debit, 0);
//     const totalCredit = formatted.reduce((s, e) => s + e.credit, 0);
//     const closingBalance = formatted.length > 0 ? formatted[formatted.length - 1].balance : 0;

//     // Get customer balance for reference
//     const customers = await db.select().from(customersTable)
//       .where(and(eq(customersTable.id, partyId), eq(customersTable.userId, userId)));

//     res.json({
//       entries: formatted,
//       openingBalance: 0,
//       closingBalance: closingBalance,
//       totalDebit: totalDebit,
//       totalCredit: totalCredit,
//       customerBalance: customers[0] ? parseFloat(customers[0].balance || "0") : 0
//     });
//   } catch (err) {
//     req.log.error(err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// function formatCustomer(c: any) {
//   return {
//     ...c,
//     balance: parseFloat(c.balance || "0"),
//     createdAt: c.createdAt?.toISOString?.() || c.createdAt,
//     updatedAt: c.updatedAt?.toISOString?.() || c.updatedAt
//   };
// }

// function formatLedgerEntry(e: any) {
//   return {
//     id: e.id,
//     date: e.date?.toISOString?.() || e.date,
//     description: e.description,
//     debit: parseFloat(e.debit || "0"),
//     credit: parseFloat(e.credit || "0"),
//     balance: parseFloat(e.balance || "0"),
//     type: e.type,
//     invoiceNo: e.invoiceNo,
//     createdAt: e.createdAt?.toISOString?.() || e.createdAt,
//   };
// }

// export default router;



import { Router } from "express";
import { db } from "@workspace/db";
import { customersTable, ledgerEntriesTable } from "@workspace/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { search } = req.query;
    let customers = await db.select().from(customersTable)
      .where(eq(customersTable.userId, userId))
      .orderBy(customersTable.name);
    if (search) {
      const q = (search as string).toLowerCase();
      customers = customers.filter(c => c.name.toLowerCase().includes(q));
    }
    res.json(customers.map(formatCustomer));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const id = parseInt(req.params.id);
    const customers = await db.select().from(customersTable)
      .where(and(eq(customersTable.id, id), eq(customersTable.userId, userId)));
    if (!customers[0]) return res.status(404).json({ error: "Not found" });
    res.json(formatCustomer(customers[0]));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { name, phone, email, address, gstNumber } = req.body;
    const result = await db.insert(customersTable)
      .values({ userId, name, phone, email, address, gstNumber })
      .returning();
    res.status(201).json(formatCustomer(result[0]));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const id = parseInt(req.params.id);
    const { name, phone, email, address, gstNumber } = req.body;
    const result = await db.update(customersTable)
      .set({ name, phone, email, address, gstNumber })
      .where(and(eq(customersTable.id, id), eq(customersTable.userId, userId)))
      .returning();
    if (!result[0]) return res.status(404).json({ error: "Not found" });
    res.json(formatCustomer(result[0]));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const id = parseInt(req.params.id);
    await db.delete(customersTable)
      .where(and(eq(customersTable.id, id), eq(customersTable.userId, userId)));
    res.json({ message: "Deleted" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// FIXED: Ledger endpoint with proper date filtering
router.get("/:id/ledger", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const partyId = parseInt(req.params.id);
    const { fromDate, toDate } = req.query;

    console.log("=== LEDGER REQUEST ===");
    console.log("Party ID:", partyId);
    console.log("From Date:", fromDate);
    console.log("To Date:", toDate);

    // Start with base conditions
    let conditions: any = and(
      eq(ledgerEntriesTable.userId, userId),
      eq(ledgerEntriesTable.partyType, "customer"),
      eq(ledgerEntriesTable.partyId, partyId)
    );

    // Add date filters if provided and valid
    if (fromDate && fromDate !== "" && fromDate !== "undefined") {
      const fromDateObj = new Date(fromDate as string);
      if (!isNaN(fromDateObj.getTime())) {
        fromDateObj.setHours(0, 0, 0, 0);
        conditions = and(conditions, gte(ledgerEntriesTable.date, fromDateObj));
        console.log("Filtering from date:", fromDateObj);
      }
    }

    if (toDate && toDate !== "" && toDate !== "undefined") {
      const toDateObj = new Date(toDate as string);
      if (!isNaN(toDateObj.getTime())) {
        toDateObj.setHours(23, 59, 59, 999);
        conditions = and(conditions, lte(ledgerEntriesTable.date, toDateObj));
        console.log("Filtering to date:", toDateObj);
      }
    }

    // Execute query with filters
    let entries = await db.select().from(ledgerEntriesTable)
      .where(conditions)
      .orderBy(ledgerEntriesTable.date, ledgerEntriesTable.createdAt);

    console.log(`Found ${entries.length} entries after filtering`);
    if (entries.length > 0) {
      console.log("First entry date:", entries[0].date);
      console.log("Last entry date:", entries[entries.length - 1].date);
    }

    const formatted = entries.map(formatLedgerEntry);
    const totalDebit = formatted.reduce((s, e) => s + e.debit, 0);
    const totalCredit = formatted.reduce((s, e) => s + e.credit, 0);
    const closingBalance = formatted.length > 0 ? formatted[formatted.length - 1].balance : 0;

    res.json({
      entries: formatted,
      openingBalance: 0,
      closingBalance,
      totalDebit,
      totalCredit
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

function formatCustomer(c: any) {
  return { ...c, balance: parseFloat(c.balance || "0"), createdAt: c.createdAt?.toISOString?.() || c.createdAt };
}

function formatLedgerEntry(e: any) {
  return {
    id: e.id,
    date: e.date?.toISOString?.() || e.date,
    description: e.description,
    debit: parseFloat(e.debit || "0"),
    credit: parseFloat(e.credit || "0"),
    balance: parseFloat(e.balance || "0"),
    type: e.type,
    invoiceNo: e.invoiceNo,
    createdAt: e.createdAt?.toISOString?.() || e.createdAt,
  };
}

export default router;