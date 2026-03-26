import { defineStore } from "pinia";

export interface CourseMenuNode {
  menuId: number | null;
  menuName: string;
  parentId: number | null;
  menuLevel: number | null;
  isVisible: number | null;
  children?: CourseMenuNode[];
}

export const useCourseMenuStore = defineStore("course-menu", {
  state: () => ({
    tree: [] as CourseMenuNode[],
    loaded: false,
  }),
  actions: {
    setTree(tree: CourseMenuNode[]) {
      this.tree = Array.isArray(tree) ? tree : [];
      this.loaded = this.tree.length > 0;
    },
    clearTree() {
      this.tree = [];
      this.loaded = false;
    },
  },
});
