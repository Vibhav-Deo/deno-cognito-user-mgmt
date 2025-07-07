import { DynamoDBClient, PutItemCommand, GetItemCommand } from "../deps.ts";
import { AWS } from "../deps.ts";
import { ApiResponse, createApiResponse } from "../utils/apiResponse.ts";

const client = new DynamoDBClient({ region: "ap-southeast-2" });

export async function saveUserProfile(
  profile: Record<string, any>
): Promise<ApiResponse<boolean>> {
  try {
    const command = new PutItemCommand({
      TableName: "UserProfile",
      Item: AWS.marshall(profile),
    });

    await client.send(command);
    return createApiResponse(true);
  } catch (error) {
    console.error("SaveUserProfile error:", error);

    if (error instanceof Error) {
      return createApiResponse<boolean>(undefined, {
        code: "DYNAMODB_ERROR",
        message: "Failed to save user profile",
      });
    }

    return createApiResponse<boolean>(undefined, {
      code: "INTERNAL_ERROR",
      message: "Database service unavailable",
    });
  }
}

export async function getUserProfile(
  id: string
): Promise<ApiResponse<Record<string, any> | null>> {
  try {
    const command = new GetItemCommand({
      TableName: "UserProfile",
      Key: { id: { S: id } },
    });

    const result = await client.send(command);

    if (!result.Item) {
      return createApiResponse(null);
    }

    return createApiResponse(AWS.unmarshall(result.Item));
  } catch (error) {
    console.error("GetUserProfile error:", error);

    if (error instanceof Error) {
      return createApiResponse<Record<string, any> | null>(undefined, {
        code: "DYNAMODB_ERROR",
        message: "Failed to fetch user profile",
      });
    }

    return createApiResponse<Record<string, any> | null>(undefined, {
      code: "INTERNAL_ERROR",
      message: "Database service unavailable",
    });
  }
}
