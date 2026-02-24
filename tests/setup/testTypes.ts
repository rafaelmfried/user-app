/* eslint-disable @typescript-eslint/no-explicit-any */
import { jest } from "@jest/globals";
import type { Request } from "express";

// Generic mock type
type MockFn = jest.Mock<any>;

/**
 * Helper types for Express mock responses in tests
 */
export interface MockResponse {
  status: MockFn;
  json: MockFn;
}

export function createMockResponse(): {
  res: MockResponse;
  statusMock: MockFn;
  jsonMock: MockFn;
} {
  const jsonMock = jest.fn<any>();
  const statusMock = jest.fn<any>().mockReturnValue({ json: jsonMock });
  const res: MockResponse = {
    status: statusMock,
    json: jsonMock,
  };
  return { res, statusMock, jsonMock };
}

export function createMockRequest(overrides: Partial<Request> = {}): Partial<Request> {
  return {
    body: {},
    params: {},
    query: {},
    ...overrides,
  };
}

export function createMockNext(): MockFn {
  return jest.fn<any>();
}

/**
 * Helper type for mocking pg.Pool
 */
export interface MockPool {
  query: MockFn;
  connect: MockFn;
  end: MockFn;
}

export function createMockPool(): MockPool {
  return {
    query: jest.fn<any>(),
    connect: jest.fn<any>(),
    end: jest.fn<any>(),
  };
}
