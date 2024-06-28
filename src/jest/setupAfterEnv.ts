import { jest } from "@jest/globals";
import { config } from "dotenv";
import "@testing-library/jest-dom";

config();

beforeEach(() => {
    jest.useFakeTimers({ advanceTimers: true });
});

afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
});