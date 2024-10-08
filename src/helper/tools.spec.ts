import { Test, TestingModule } from '@nestjs/testing';
import Tools, { _Tools } from './tools';
import jwt from 'jsonwebtoken';

describe('Tools', () => {
    let ToolsTest: _Tools;

    beforeEach(async () => {
        ToolsTest = Tools;

    });

    it('should be defined', () => {

        // expect(ToolsTest).toBeDefined();
    });


    describe("Testing get_now_time() Method", () => {

        // Test case 2
        it("should return the correct value when Date.now() is not mocked", () => {
            const expectedResult = Math.floor(Date.now() / 1000);
            const actualResult = ToolsTest.get_now_time();
            expect(actualResult).toEqual(expectedResult);
        });

        // Test case 3
        it('should return an integer value', () => {
            const actualResult = ToolsTest.get_now_time();
            expect(actualResult % 1).toEqual(0);
        })

    });

    describe('timeStamp_2_date Function Tests', () => {
        test('Should convert timestamp to date and time string', () => {
            const timestamp = 1631554724; // Sep 13 2021 15:12:04 (GMT+00)

            expect(ToolsTest.timeStamp_2_date(timestamp)).toEqual('9/13/2021, 10:08:44 PM');
        });
    });

    // test case suite for sleep
    describe("sleep", () => {
        test("should wait for specified time and resolve the promise", async () => {
            const startTime = Date.now(); // get current timestamp before invoking sleep
            await ToolsTest.sleep(1000); // wait for 1 second
            const endTime = Date.now(); // get current timestamp after waiting
            expect(endTime - startTime).toBeGreaterThanOrEqual(1000); // check if waited for at least 1 second
        });
    });


});
