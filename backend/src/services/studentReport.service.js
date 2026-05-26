const { pool } =
require("../config/db");

exports.getStudentsReport = async (

    classId,

    sectionId,

    academicYearId

) => {

    // =========================================
    // FUNCTION QUERY
    // =========================================

    const query = `

        SELECT *

        FROM fn_get_students_full_details(

            $1,
            $2,
            $3

        );

    `;


    // EXECUTE
    const result =
    await pool.query(

        query,

        [

            classId || null,

            sectionId || null,

            academicYearId || null

        ]

    );


    // =========================================
    // RETURN DATA
    // =========================================

    return result.rows;

};