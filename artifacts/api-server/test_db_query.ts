import { db } from "@workspace/db";
import { communityQuestionsTable, communityAnswersTable, usersTable } from "@workspace/db/schema";
import { eq, desc, count } from "drizzle-orm";

async function testQuery() {
  const status = "Pending";
  try {
    const questions = await db
      .select({
        id: communityQuestionsTable.id,
        userId: communityQuestionsTable.userId,
        userGender: communityQuestionsTable.userGender,
        text: communityQuestionsTable.text,
        category: communityQuestionsTable.category,
        isAnonymous: communityQuestionsTable.isAnonymous,
        status: communityQuestionsTable.status,
        createdAt: communityQuestionsTable.createdAt,
        updatedAt: communityQuestionsTable.updatedAt,
        approvedAt: communityQuestionsTable.approvedAt,
        rejectedAt: communityQuestionsTable.rejectedAt,
        rejectionReason: communityQuestionsTable.rejectionReason,
        totalAnswers: count(communityAnswersTable.id),
        user: {
          name: usersTable.name,
          email: usersTable.email,
          photoUrl: usersTable.photoUrl,
        }
      })
      .from(communityQuestionsTable)
      .leftJoin(usersTable, eq(usersTable.id, communityQuestionsTable.userId))
      .leftJoin(communityAnswersTable, eq(communityAnswersTable.questionId, communityQuestionsTable.id))
      .where(eq(communityQuestionsTable.status, status))
      .groupBy(communityQuestionsTable.id, usersTable.id)
      .orderBy(desc(communityQuestionsTable.createdAt));
      
    console.log("SUCCESS!", questions);
  } catch (err) {
    console.error("DB ERROR!", err);
  }
}

testQuery();
