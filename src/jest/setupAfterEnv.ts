import { jest } from "@jest/globals";
import { config } from "dotenv";

config();

beforeEach(() => {
    jest.useFakeTimers({ advanceTimers: true });
});

afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
});