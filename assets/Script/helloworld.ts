const { ccclass, property } = cc._decorator;

const COLORS = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF"];

@ccclass
export class helloworld extends cc.Component {

    @property(cc.EditBox)
    inputX: cc.EditBox = null!;

    @property(cc.EditBox)
    inputY: cc.EditBox = null!;

    @property(cc.Node)
    generateBtn: cc.Node = null!;

    @property(cc.Node)
    matrixContainer: cc.Node = null!;

    @property([cc.SpriteFrame])
    colorFrames: cc.SpriteFrame[] = [];

    @property(cc.Node)
    button: cc.Node = null;
    private matrix: string[][] = [];
    onLoad() {
        this.generateBtn.on(cc.Node.EventType.MOUSE_DOWN, this.generateMatrix, this);

        //第二道测试题
        function canSum(a: number[], b: number[], v: number): boolean {
            for (let numA of a) {
                for (let numB of b) {
                    if (numA + numB === v) {
                        return true;
                    }
                }
            }
            return false;
        }
        const a = [10, 40, 5, 280];
        const b = [234, 5, 2, 148, 23];
        const v = 42;
        console.log(canSum(a, b, v));  // 输出：true
        //双For循环 数组A有N个元素 数组B有M个元素 
        //复杂度就是o(n*m)


        //第三道测试题
        this.btnTween()
        this.button.on(cc.Node.EventType.MOUSE_DOWN, this.onClickDOWN, this);
        this.button.on(cc.Node.EventType.MOUSE_UP, this.onClickUP, this);
    }
    btnTween() {
        let size: number = 0.02
        cc.tween(this.button)
            .to(0.5, { scaleX: this.button.scaleX + size, scaleY: this.button.scaleY - size })
            .to(0.5, { scaleX: this.button.scaleX - size, scaleY: this.button.scaleY + size })
            .union()
            .repeatForever()
            .start()
    }
    onClickDOWN() {
        this.button.stopAllActions()
        this.button.scale = 0.9
        let _size: number = 0.05
        cc.tween(this.button)
            .to(0.1, { scale: this.button.scale - _size })
            .to(0.1, { scale: this.button.scale + _size })
            .to(0.1, { scale: this.button.scale - _size / 2 })
            .to(0.1, { scale: this.button.scale + _size / 2 })
            .call(() => {
                this.btnTween();
            })
            .start()
    }
    onClickUP() {
        this.button.stopAllActions()
        this.button.scale = 1
        let _size: number = 0.05
        cc.tween(this.button)
            .to(0.1, { scale: this.button.scale + _size })
            .to(0.1, { scale: this.button.scale - _size })
            .to(0.1, { scale: this.button.scale + _size / 2 })
            .to(0.1, { scale: this.button.scale - _size / 2 })
            .call(() => {
                this.btnTween();
            })
            .start()
    }

    private generateMatrix() {
        let x = parseFloat(this.inputX.string);
        let y = parseFloat(this.inputY.string);
        if (isNaN(x) || isNaN(y)) {
            x = y = 0
        }

        this.matrix = this.createEmptyMatrix();
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                this.matrix[row][col] = this.getColorForCell(row, col, x, y);
            }
        }
        // 显示矩阵
        this.displayMatrix();
    }

    // 创建一个空矩阵
    private createEmptyMatrix(): string[][] {
        let matrix: string[][] = [];
        for (let i = 0; i < 10; i++) {
            matrix[i] = [];
            for (let j = 0; j < 10; j++) {
                matrix[i][j] = '';
            }
        }
        return matrix;
    }

    // 获取指定位置的颜色
    private getColorForCell(row: number, col: number, x: number, y: number): string {
        let colorProbabilities = this.getInitialColorProbabilities(row, col, x, y);

        // 计算概率
        const random = Math.random();
        let cumulativeProbability = 0;
        for (let i = 0; i < COLORS.length; i++) {
            cumulativeProbability += colorProbabilities[i];
            if (random < cumulativeProbability) {
                return COLORS[i];
            }
        }

        // 默认返回最后一个颜色
        return COLORS[COLORS.length - 1];
    }

    // 根据规则计算每个位置的颜色选择概率
    private getInitialColorProbabilities(row: number, col: number, x: number, y: number): number[] {
        const probabilities = new Array(COLORS.length).fill(1 / COLORS.length);

        if (row === 0 && col === 0) {
            // 左上角的随机选择
            const randIdx = Math.floor(Math.random() * COLORS.length);
            probabilities.fill(0);
            probabilities[randIdx] = 1; // 随机选择一个颜色
        } else {
            // 获取相邻单元格的颜色
            const leftColor = col > 0 ? this.matrix[row][col - 1] : null;
            const topColor = row > 0 ? this.matrix[row - 1][col] : null;
            // 如果有左边和上边的单元格
            if (leftColor && topColor) {
                // 增加概率
                if (leftColor === topColor) {
                    this.adjustColorProbabilities(probabilities, leftColor, y);
                } else {
                    this.adjustColorProbabilities(probabilities, leftColor, x);
                    this.adjustColorProbabilities(probabilities, topColor, x);
                }
            } else if (leftColor) {
                this.adjustColorProbabilities(probabilities, leftColor, x);
            } else if (topColor) {
                this.adjustColorProbabilities(probabilities, topColor, x);
            }
        }

        return probabilities;
    }

    // 调整颜色概率
    private adjustColorProbabilities(probabilities: number[], color: string, percentage: number) {
        const colorIndex = COLORS.indexOf(color);
        if (colorIndex !== -1) {
            probabilities[colorIndex] += (percentage / 100);
            const totalProb = probabilities.reduce((sum, p) => sum + p, 0);
            for (let i = 0; i < probabilities.length; i++) {
                probabilities[i] /= totalProb;
            }
        }
    }

    private displayMatrix() {
        this.matrixContainer.removeAllChildren();

        const offsetX = 10;
        const offsetY = 10;
        const startX = -250;
        const startY = 300;
        const size = 50;

        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                const colorHex = this.matrix[row][col];
                const color = new cc.Color().fromHEX(colorHex);

                const graphicsNode = new cc.Node();
                const graphics = graphicsNode.addComponent(cc.Graphics);

                graphics.fillColor = color;
                graphics.rect(0, 0, size, size);
                graphics.fill(); // 填充颜色

                graphicsNode.width = size;
                graphicsNode.height = size;

                const posX = startX + col * (offsetX + size);
                const posY = startY - row * (offsetY + size);
                graphicsNode.setPosition(posX, posY);

                this.matrixContainer.addChild(graphicsNode);
            }
        }
    }

}
