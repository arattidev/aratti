import { describe, expect, it } from "vitest";
import renderer from "react-test-renderer";
import { Text } from "react-native";

import { SurfaceCard } from "./surface-card";

describe("SurfaceCard", () => {
  it("renders children", () => {
    const tree = renderer
      .create(
        <SurfaceCard>
          <Text>hello</Text>
        </SurfaceCard>,
      )
      .toJSON();

    expect(tree).toBeTruthy();
  });
});
