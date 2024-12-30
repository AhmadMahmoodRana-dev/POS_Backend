const { Router } = require ("express");
const { getConnection } = require ("../../db.js")  ;

const router = Router();

// Helper function to map database rows to objects
const mapCompanyRow = (row) => {
  const [
    COMPANY_ID,
    COMPANY_NAME,
    COMAPNY_SHORT_DESC,
    ADDRESS,
    PHONE_NO,
    FAX_NO,
    UAN,
    EMAIL,
    CITY,
    COUNTRY,
    CREATED_BY,
    CREATION_DATE,
    LAST_UPDATED_BY,
    LAST_UPDATE_DATE,
    URL,
    NTN,
    STN,
  ] = row;

  return {
    COMPANY_ID,
    COMPANY_NAME,
    COMAPNY_SHORT_DESC,
    ADDRESS,
    PHONE_NO,
    FAX_NO,
    UAN,
    EMAIL,
    CITY,
    COUNTRY,
    CREATED_BY,
    CREATION_DATE,
    LAST_UPDATED_BY,
    LAST_UPDATE_DATE,
    URL,
    NTN,
    STN,
  };
};

// ** GET all companies **
router.get("/companies", async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute("SELECT * FROM SYS_COMPANIES");
    const companies = result.rows.map(mapCompanyRow);
    res.json(companies);
  } catch (err) {
    console.error("Error fetching companies:", err);
    res.status(500).send("Error fetching companies");
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
});

// ** GET a single company by ID **
router.get("/companies/:id", async (req, res) => {
  const { id } = req.params;
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      "SELECT * FROM SYS_COMPANIES WHERE COMPANY_ID = :id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Company not found");
    }

    const company = mapCompanyRow(result.rows[0]);
    res.json(company);
  } catch (err) {
    console.error("Error fetching company:", err);
    res.status(500).send("Error fetching company");
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
});

// ** POST to create a new company **
router.post("/companies", async (req, res) => {
  const {
    COMPANY_NAME,
    COMAPNY_SHORT_DESC,
    ADDRESS,
    PHONE_NO,
    FAX_NO,
    UAN,
    EMAIL,
    CITY,
    COUNTRY,
    CREATED_BY,
    CREATION_DATE,
    LAST_UPDATED_BY,
    LAST_UPDATE_DATE,
    URL,
    NTN,
    STN,
  } = req.body;

  let connection;
  try {
    connection = await getConnection();

    // Ensure the sequence exists (manual verification in the database is required)
    const result = await connection.execute(
      `INSERT INTO SYS_COMPANIES (
                COMPANY_ID,
                COMPANY_NAME,
                COMAPNY_SHORT_DESC,
                ADDRESS,
                PHONE_NO,
                FAX_NO,
                UAN,
                EMAIL,
                CITY,
                COUNTRY,
                CREATED_BY,
                CREATION_DATE,
                LAST_UPDATED_BY,
                LAST_UPDATE_DATE,
                URL,
                NTN,
                STN
            ) VALUES (
                SYS_COMPANIES_SEQ.NEXTVAL,
                :COMPANY_NAME,
                :COMAPNY_SHORT_DESC,
                :ADDRESS,
                :PHONE_NO,
                :FAX_NO,
                :UAN,
                :EMAIL,
                :CITY,
                :COUNTRY,
                :CREATED_BY,
                :CREATION_DATE,
                :LAST_UPDATED_BY,
                :LAST_UPDATE_DATE,
                :URL,
                :NTN,
                :STN
            )`,
      {
        COMPANY_NAME,
        COMAPNY_SHORT_DESC,
        ADDRESS,
        PHONE_NO,
        FAX_NO,
        UAN,
        EMAIL,
        CITY,
        COUNTRY,
        CREATED_BY,
        CREATION_DATE: CREATION_DATE || new Date(),
        LAST_UPDATED_BY,
        LAST_UPDATE_DATE: LAST_UPDATE_DATE || new Date(),
        URL,
        NTN,
        STN,
      },
      { autoCommit: true }
    );

    res
      .status(201)
      .json({ message: "Company created", companyId: result.lastRowid });
  } catch (err) {
    if (err.errorNum === 2289) {
      console.error(
        "Sequence SYS_COMPANIES_SEQ does not exist. Ensure it's created in the database."
      );
      res
        .status(500)
        .send(
          "Database sequence SYS_COMPANIES_SEQ does not exist. Contact admin."
        );
    } else {
      console.error("Error creating company:", err);
      res.status(500).send("Error creating company");
    }
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
});

// ** PUT to update an existing company by ID **
router.put("/companies/:id", async (req, res) => {
  const { id } = req.params;
  const {
    COMPANY_NAME,
    COMAPNY_SHORT_DESC,
    ADDRESS,
    PHONE_NO,
    FAX_NO,
    UAN,
    EMAIL,
    CITY,
    COUNTRY,
    LAST_UPDATED_BY,
    LAST_UPDATE_DATE,
    URL,
    NTN,
    STN,
  } = req.body;

  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(
      `UPDATE SYS_COMPANIES SET
                COMPANY_NAME = :COMPANY_NAME,
                COMAPNY_SHORT_DESC = :COMAPNY_SHORT_DESC,
                ADDRESS = :ADDRESS,
                PHONE_NO = :PHONE_NO,
                FAX_NO = :FAX_NO,
                UAN = :UAN,
                EMAIL = :EMAIL,
                CITY = :CITY,
                COUNTRY = :COUNTRY,
                LAST_UPDATED_BY = :LAST_UPDATED_BY,
                LAST_UPDATE_DATE = :LAST_UPDATE_DATE,
                URL = :URL,
                NTN = :NTN,
                STN = :STN
            WHERE COMPANY_ID = :id`,
      {
        COMPANY_NAME,
        COMAPNY_SHORT_DESC,
        ADDRESS,
        PHONE_NO,
        FAX_NO,
        UAN,
        EMAIL,
        CITY,
        COUNTRY,
        LAST_UPDATED_BY,
        LAST_UPDATE_DATE: LAST_UPDATE_DATE || new Date(),
        URL,
        NTN,
        STN,
        id,
      },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).send("Company not found");
    }

    res.json({ message: "Company updated successfully" });
  } catch (err) {
    console.error("Error updating company:", err);
    res.status(500).send("Error updating company");
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
});

// ** DELETE a company by ID **
router.delete('/companies/:id', async (req, res) => {
    const { id } = req.params;

    let connection;
    try {
        connection = await getConnection();

        const result = await connection.execute(
            'DELETE FROM SYS_COMPANIES WHERE COMPANY_ID = :id',
            [id],
            { autoCommit: true }
        );

        if (result.rowsAffected === 0) {
            return res.status(404).send("Company not found");
        }

        res.json({ message: "Company deleted successfully" });
    } catch (err) {
        console.error("Error deleting company:", err);
        res.status(500).send("Error deleting company");
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error("Error closing connection:", err);
            }
        }
    }
});


module.exports = router;
