const mongoose = require("mongoose");

const Account = mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
      index: {
        unique: true,
      },
    },
    alias: { type: String },
    email: { type: String },
    bio: { type: String },
    nonce: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

//*** --- function for response JSON for record list request
Account.methods.toAccountJSON = function () {
  return {
    address: this.address,
    alias: this.alias,
    email: this.email,
    bio: this.bio,
  };
};

mongoose.model("Account", Account);
